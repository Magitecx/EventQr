import { OrganizationRole } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { successResponse } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { buildAuthPayload, requireMembership } from "../auth/auth.utils";
import {
  createInviteSchema,
  createOrganizationSchema,
  joinOrganizationSchema,
  updateOrganizationSchema,
} from "./organizations.schemas";

async function generateUniqueJoinCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const joinCode = randomBytes(4).toString("hex").toUpperCase();
    const existing = await prisma.organization.findUnique({
      where: {
        joinCode,
      },
    });

    if (!existing) {
      return joinCode;
    }
  }

  throw new ApiError(500, "Failed to generate join code");
}

async function generateUniqueInviteToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = randomBytes(24).toString("hex");
    const existing = await prisma.organizationInvite.findUnique({
      where: {
        token,
      },
    });

    if (!existing) {
      return token;
    }
  }

  throw new ApiError(500, "Failed to generate invite token");
}

export const getOrganizations = asyncHandler(async (request, response) => {
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      userId: request.auth!.userId,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  response.json(
    successResponse({
      items: memberships.map((membership) => ({
        membershipId: membership.id,
        organizationId: membership.organizationId,
        organizationName: membership.organization.name,
        joinCode: membership.organization.joinCode,
        role: membership.role,
      })),
      activeOrganizationId: request.auth!.organizationId,
    }),
  );
});

export const createOrganization = asyncHandler(async (request, response) => {
  const body = createOrganizationSchema.parse(request.body);
  const joinCode = await generateUniqueJoinCode();

  const organization = await prisma.organization.create({
    data: {
      name: body.name,
      joinCode,
      memberships: {
        create: {
          userId: request.auth!.userId,
          role: OrganizationRole.OWNER,
        },
      },
    },
  });

  response
    .status(201)
    .json(successResponse(await buildAuthPayload(request.auth!.userId, organization.id), "Organization created"));
});

export const joinOrganization = asyncHandler(async (request, response) => {
  const body = joinOrganizationSchema.parse(request.body);

  const organization = await prisma.organization.findUnique({
    where: {
      joinCode: body.joinCode.toUpperCase(),
    },
  });

  if (!organization) {
    throw new ApiError(404, "Organization code not found");
  }

  await prisma.organizationMembership.upsert({
    where: {
      userId_organizationId: {
        userId: request.auth!.userId,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: request.auth!.userId,
      organizationId: organization.id,
      role: OrganizationRole.MEMBER,
    },
  });

  response.json(
    successResponse(await buildAuthPayload(request.auth!.userId, organization.id), "Organization joined"),
  );
});

export const getInvitePublicInfo = asyncHandler(async (request, response) => {
  const token = request.params.token as string;

  const invite = await prisma.organizationInvite.findUnique({
    where: {
      token,
    },
    include: {
      organization: true,
      createdBy: true,
    },
  });

  if (!invite) {
    throw new ApiError(404, "Invite not found");
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new ApiError(410, "Invite has expired");
  }

  response.json(
    successResponse({
      organizationId: invite.organizationId,
      organizationName: invite.organization.name,
      expiresAt: invite.expiresAt,
      createdByName: invite.createdBy.name,
    }),
  );
});

export const acceptInvite = asyncHandler(async (request, response) => {
  const token = request.params.token as string;

  const invite = await prisma.organizationInvite.findUnique({
    where: {
      token,
    },
  });

  if (!invite) {
    throw new ApiError(404, "Invite not found");
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new ApiError(410, "Invite has expired");
  }

  const existingMembership = await prisma.organizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: request.auth!.userId,
        organizationId: invite.organizationId,
      },
    },
  });

  if (!existingMembership) {
    await prisma.$transaction([
      prisma.organizationMembership.create({
        data: {
          userId: request.auth!.userId,
          organizationId: invite.organizationId,
          role: OrganizationRole.MEMBER,
        },
      }),
      prisma.organizationInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  response.json(
    successResponse(
      await buildAuthPayload(request.auth!.userId, invite.organizationId),
      existingMembership ? "Organization already joined" : "Invite accepted",
    ),
  );
});

export const getCurrentOrganization = asyncHandler(async (request, response) => {
  const organizationId = request.auth!.organizationId!;
  await requireMembership(request.auth!.userId, organizationId);

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      memberships: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      invites: {
        include: {
          createdBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  response.json(
    successResponse({
      id: organization.id,
      name: organization.name,
      joinCode: organization.joinCode,
      members: organization.memberships.map((membership) => ({
        membershipId: membership.id,
        userId: membership.userId,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        createdAt: membership.createdAt,
      })),
      invites: organization.invites.map((invite) => ({
        id: invite.id,
        token: invite.token,
        expiresAt: invite.expiresAt,
        usedCount: invite.usedCount,
        createdAt: invite.createdAt,
        createdByName: invite.createdBy.name,
      })),
    }),
  );
});

export const updateCurrentOrganization = asyncHandler(async (request, response) => {
  const body = updateOrganizationSchema.parse(request.body);
  const organizationId = request.auth!.organizationId!;
  await requireMembership(request.auth!.userId, organizationId);

  const organization = await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      name: body.name,
    },
  });

  response.json(successResponse(organization, "Organization updated"));
});

export const regenerateJoinCode = asyncHandler(async (request, response) => {
  const organizationId = request.auth!.organizationId!;
  await requireMembership(request.auth!.userId, organizationId);
  const joinCode = await generateUniqueJoinCode();

  const organization = await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      joinCode,
    },
  });

  response.json(successResponse({ joinCode: organization.joinCode }, "Join code regenerated"));
});

export const createInvite = asyncHandler(async (request, response) => {
  const body = createInviteSchema.parse(request.body);
  const organizationId = request.auth!.organizationId!;
  await requireMembership(request.auth!.userId, organizationId);
  const token = await generateUniqueInviteToken();

  const invite = await prisma.organizationInvite.create({
    data: {
      organizationId,
      createdByUserId: request.auth!.userId,
      token,
      expiresAt: body.expiresInDays
        ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    },
    include: {
      createdBy: true,
    },
  });

  response.status(201).json(
    successResponse(
      {
        id: invite.id,
        token: invite.token,
        expiresAt: invite.expiresAt,
        usedCount: invite.usedCount,
        createdAt: invite.createdAt,
        createdByName: invite.createdBy.name,
      },
      "Invite created",
    ),
  );
});
