import fs from "fs";
import path from "path";
import axios from "axios";
import os from "os";
import { fileURLToPath } from "url";

export const DATA_DIR = path.join(os.tmpdir(), "kompon-data");

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(SCRIPT_DIR, "..", "..");
const LOCAL_SCENARIO_DIR = path.join(BACKEND_DIR, "data", "scenario_parquets");

const SCENARIO_EVENT_FILE_ALIASES = {
  1: "usp0003k6t",
  2: "us7000fx45",
  3: "us7000dy3b",
  4: "us7000lfaa",
  5: "us6000rpht",
  6: "us2000hd8v",
  7: "usp000ea1q",
  8: "us7000s0pc",
};

function findExistingCandidate(candidates) {
  const dirs = [DATA_DIR, LOCAL_SCENARIO_DIR];

  for (const dir of dirs) {
    for (const file of candidates) {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        return { file, filePath };
      }
    }
  }

  return null;
}

export async function fetchServingData() {
  const repoId = process.env.HF_DATASET_REPO;
  if (!repoId) {
    console.warn("[DuckDB] HF_DATASET_REPO not set. Skipping parquet download. (DuckDB will fail if files are missing locally)");
    return;
  }

  // Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const baseUrl = `https://huggingface.co/datasets/${repoId}/resolve/main`;
  
  const fileGroups = [
    ["hazard_grid.parquet"],
    ...Array.from({ length: 8 }, (_, index) => {
      const id = index + 1;
      const alias = SCENARIO_EVENT_FILE_ALIASES[id];
      return [
        `scenario_${id}.parquet`,
        `scenario_event_${id}.parquet`,
        `scenario_${alias}.parquet`,
      ];
    }),
  ];

  console.log(`[DuckDB] Fetching ${fileGroups.length} parquet data groups from HF Datasets (${repoId})...`);

  for (const candidates of fileGroups) {
    const existing = findExistingCandidate(candidates);
    if (existing) {
      console.log(`[DuckDB] File ${existing.filePath} already exists, skipping download.`);
      continue;
    }

    let downloaded = false;
    let lastError = null;

    for (const file of candidates) {
      const dest = path.join(DATA_DIR, file);

      try {
        console.log(`[DuckDB] Downloading ${file}...`);
        const response = await axios({
          url: `${baseUrl}/${file}`,
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        downloaded = true;
        break;
      } catch (err) {
        lastError = err;
        if (fs.existsSync(dest)) fs.rmSync(dest, { force: true });
      }
    }

    if (!downloaded) {
      console.error(`[DuckDB] Failed to download any of: ${candidates.join(", ")}. Last error: ${lastError?.message}`);
    }
  }
  
  console.log("[DuckDB] Finished fetching parquet files.");
}
