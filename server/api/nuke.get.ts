import { logger } from "~/utils/logger";
import { cloudDb } from "~~/server/utils/db/cloud";
import { eq } from "drizzle-orm";
import { auth } from "~/utils/auth";

export default defineEventHandler(async (event) => {
  logger.debug("GET /api/nuke");

  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    logger.error("GET /api/nuke: Unauthorized access attempt");
    setResponseStatus(event, 401);
    return {
      message: "Unauthorized",
    };
  }
  const userId = session.user.id;

  try {
    return { success: true };
  } catch (error) {
    logger.error(error, "GET /api/nuke: Error deleting data");
    setResponseStatus(event, 500);
    return {
      message: "Internal Server Error",
    };
  }
});
