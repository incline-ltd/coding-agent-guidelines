import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const jsonFiles = [
  ".claude-plugin/marketplace.json",
  "plugins/coding-agent-guidelines/.claude-plugin/plugin.json",
];

const yamlFiles = [
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/failure_mode.yml",
  ".github/ISSUE_TEMPLATE/tool_compatibility.yml",
  ".github/workflows/validate.yml",
];

const frontmatterFiles = [
  "SKILL.md",
  ".claude/skills/coding-agent-guidelines/SKILL.md",
  "plugins/coding-agent-guidelines/skills/coding-agent-guidelines/SKILL.md",
  "CURSOR.md",
  ".cursor/rules/coding-agent-guidelines.mdc",
];

const skillFiles = frontmatterFiles.slice(0, 3);

function fail(message) {
  console.error(message);
  process.exit(1);
}

const parsedJson = new Map();

for (const file of jsonFiles) {
  try {
    parsedJson.set(file, JSON.parse(readFileSync(file, "utf8")));
  } catch (error) {
    fail(`${file}: ${error.message}`);
  }
}

const marketplaceVersion = parsedJson.get(jsonFiles[0]).plugins?.[0]?.version;
const pluginVersion = parsedJson.get(jsonFiles[1]).version;

if (!marketplaceVersion || marketplaceVersion !== pluginVersion) {
  fail("Plugin versions must match in both JSON manifests.");
}

const canonicalSkill = readFileSync(skillFiles[0]);

for (const file of skillFiles.slice(1)) {
  if (!canonicalSkill.equals(readFileSync(file))) {
    fail(`${file}: content does not match ${skillFiles[0]}`);
  }
}

const rubyScript = String.raw`
require "yaml"

frontmatter_count = Integer(ARGV.shift)
frontmatter_paths = ARGV.shift(frontmatter_count)

frontmatter_paths.each do |path|
  lines = File.readlines(path)
  raise "#{path}: missing opening frontmatter delimiter" unless lines.first&.strip == "---"

  closing_index = lines.drop(1).index { |line| line.strip == "---" }
  raise "#{path}: missing closing frontmatter delimiter" unless closing_index

  YAML.parse(lines[1, closing_index].join)
end

ARGV.each do |path|
  YAML.parse(File.read(path))
end
`;

const yamlCheck = spawnSync(
  "ruby",
  [
    "-e",
    rubyScript,
    "--",
    String(frontmatterFiles.length),
    ...frontmatterFiles,
    ...yamlFiles,
  ],
  { encoding: "utf8" },
);

if (yamlCheck.error) {
  fail(`YAML validation could not run: ${yamlCheck.error.message}`);
}

if (yamlCheck.status !== 0) {
  fail(yamlCheck.stderr.trim() || "YAML validation failed.");
}

console.log(
  `Validated ${jsonFiles.length} JSON files, ${yamlFiles.length} YAML files, ` +
    `${frontmatterFiles.length} frontmatter files, and ${skillFiles.length} synced SKILL.md copies.`,
);
