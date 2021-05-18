require('dotenv').config();

import { CommunicationIdentityClient } from "@azure/communication-identity";
import tracer from "./tracing";

const ACS_CONNECTION_STRING = process.env.COMMUNICATION_CONNECTION_STRING || "";

const rootSpan = tracer.startSpan("Root Identity Span");

const main = async () => {
  const client = new CommunicationIdentityClient(ACS_CONNECTION_STRING);
  
  console.log("Creating user...")
  const user = await client.createUser();
  console.log(`User ${user.communicationUserId} was created successfully.\n`);

  console.log(`Issuing token for ${user.communicationUserId}...`);
  const { token } = await client.getToken(user, ["chat"]);
  console.log("Token issued successfully.\n")
  console.log(`${token}\n`);

  console.log(`Revoking token for ${user.communicationUserId}...`);
  await client.revokeTokens(user);
  console.log("Token revoked successfully.\n");

  console.log(`Deleting user ${user.communicationUserId}...`);
  await client.deleteUser(user);
  console.log("User deleted successfully.\n");
}

tracer.withSpan(rootSpan, async () => {
  try {
    await main();
  } catch (e) {
    rootSpan.setAttribute("request", e.request);
    rootSpan.setAttribute("response", e.response);
    console.error("Error running sample:", JSON.stringify(e));
  } finally {
    // End the optional root span on completion
    rootSpan.end();
  }
}).then(() => {
  console.log("Awaiting batched span processor to export batched spans...");

  setTimeout(() => {
    console.log("Spans exported.");
  }, 6000);
});
