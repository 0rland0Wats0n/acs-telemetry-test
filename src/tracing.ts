require('dotenv').config();

import * as azureSdkTracing from "@azure/core-tracing";
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { NodeTracerProvider } from "@opentelemetry/node";
import { BatchSpanProcessor } from "@opentelemetry/tracing";

const AI_CONNECTION_STRING = process.env.APPLICATION_INSIGHTS_CONNECTION_STRING || "";
const provider = new NodeTracerProvider();
const azExporter = new AzureMonitorTraceExporter({
  connectionString: AI_CONNECTION_STRING
});

provider.addSpanProcessor(
  // @ts-ignore
  new BatchSpanProcessor(azExporter, {
    bufferSize: 1000, // 1000 spans
    bufferTimeout: 5000 // 5 seconds
  })
);

provider.register();

const tracer = provider.getTracer("acs-telementry-node-tracer");

// @ts-ignore
azureSdkTracing.setTracer(tracer);

export default tracer;
