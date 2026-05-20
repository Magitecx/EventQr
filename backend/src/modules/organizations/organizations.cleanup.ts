import { OrganizationStatus } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { removeStoredAttendeeImage } from "../attendees/attendees.upload";

function subtractDays(days: number, from = new Date()) {
  return new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
}

function addDays(days: number, from: Date) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

async function purgeOrganization(organizationId: string) {
  const attendees = await prisma.attendee.findMany({
    where: {
      organizationId,
    },
    select: {
      profileImageUrl: true,
    },
  });

  await Promise.all(attendees.map((attendee) => removeStoredAttendeeImage(attendee.profileImageUrl)));

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({
      where: {
        eventSession: {
          eventSeries: {
            organizationId,
          },
        },
      },
    }),
    prisma.eventSession.deleteMany({
      where: {
        eventSeries: {
          organizationId,
        },
      },
    }),
    prisma.eventSeries.deleteMany({
      where: {
        organizationId,
      },
    }),
    prisma.attendee.deleteMany({
      where: {
        organizationId,
      },
    }),
    prisma.organizationInvite.deleteMany({
      where: {
        organizationId,
      },
    }),
    prisma.organizationMembership.deleteMany({
      where: {
        organizationId,
      },
    }),
    prisma.organization.delete({
      where: {
        id: organizationId,
      },
    }),
  ]);
}

export async function runOrganizationCleanup(now = new Date()) {
  await prisma.organizationInvite.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  const warningThreshold = subtractDays(env.ORGANIZATION_INACTIVE_WARNING_DAYS, now);
  const deleteThreshold = subtractDays(env.ORGANIZATION_HARD_DELETE_DAYS, now);

  const organizationsToMarkInactive = await prisma.organization.findMany({
    where: {
      status: OrganizationStatus.ACTIVE,
      lastActivityAt: {
        lte: warningThreshold,
      },
    },
    select: {
      id: true,
      lastActivityAt: true,
    },
  });

  for (const organization of organizationsToMarkInactive) {
    await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        status: OrganizationStatus.INACTIVE,
        inactiveSinceAt: now,
        scheduledDeletionAt: addDays(env.ORGANIZATION_HARD_DELETE_DAYS, organization.lastActivityAt),
      },
    });
  }

  const purgeCandidates = await prisma.organization.findMany({
    where: {
      OR: [
        {
          lastActivityAt: {
            lte: deleteThreshold,
          },
        },
        {
          scheduledDeletionAt: {
            lte: now,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  for (const organization of purgeCandidates) {
    await purgeOrganization(organization.id);
  }
}
