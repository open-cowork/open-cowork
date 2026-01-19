"use client";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import scss from "react-syntax-highlighter/dist/esm/languages/prism/scss";
import less from "react-syntax-highlighter/dist/esm/languages/prism/less";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import cLang from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import objectivec from "react-syntax-highlighter/dist/esm/languages/prism/objectivec";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import powershell from "react-syntax-highlighter/dist/esm/languages/prism/powershell";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import ini from "react-syntax-highlighter/dist/esm/languages/prism/ini";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";

const registerSyntaxLanguages = (() => {
  let registered = false;
  return () => {
    if (registered) return;
    const register = (name: string, language: unknown) => {
      SyntaxHighlighter.registerLanguage(name, language);
    };

    register("javascript", javascript);
    register("typescript", typescript);
    register("tsx", tsx);
    register("jsx", jsx);
    register("python", python);
    register("json", jsonLang);
    register("markdown", markdown);
    register("markup", markup);
    register("bash", bash);
    register("yaml", yaml);
    register("css", css);
    register("scss", scss);
    register("less", less);
    register("go", go);
    register("java", java);
    register("php", php);
    register("ruby", ruby);
    register("swift", swift);
    register("kotlin", kotlin);
    register("csharp", csharp);
    register("c", cLang);
    register("cpp", cpp);
    register("objectivec", objectivec);
    register("sql", sql);
    register("powershell", powershell);
    register("docker", docker);
    register("ini", ini);
    register("rust", rust);
    registered = true;
  };
})();

registerSyntaxLanguages();

const PRISM_LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  cjs: "javascript",
  mjs: "javascript",
  ts: "typescript",
  py: "python",
  yml: "yaml",
  md: "markdown",
  html: "markup",
  htm: "markup",
  xml: "markup",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  "c++": "cpp",
};

export const getPrismLanguage = (raw?: string | null) => {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  return PRISM_LANGUAGE_ALIASES[normalized] ?? normalized;
};

export { SyntaxHighlighter, oneDark, oneLight };
