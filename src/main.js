import "./index.css";
import JSZip from "jszip";

const files = [
  {
    name: "StudentA",
    type: "FOLDER",
    children: [
      {
        url: "https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits",
        type: "FILE",
        name: "commits.json",
      },
    ],
  },
  {
    name: "StudentB",
    type: "FOLDER",
    children: [
      {
        url: "https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits",
        type: "FILE",
        name: "commits.json",
      },
    ],
  },
  {
    name: "StudentC",
    type: "FOLDER",
    children: [
      {
        url: "https://api.github.com/repos/javascript-tutorial/en.javascript.info/commits",
        type: "FILE",
        name: "commits.json",
      },
    ],
  },
];

const getProcessedFiles = (files, parentPath = "") => {
  const result = [];
  files.forEach((file) => {
    if (file.type === "FILE") {
      result.push({
        ...file,
        path: parentPath ? parentPath + "/" + file.name : file.name,
      });
    } else {
      const { children, ...rest } = file;
      const path = parentPath ? parentPath + "/" + file.name : file.name;
      result.push({
        ...rest,
        path,
      });
      result.push(...getProcessedFiles(children, path));
    }
  });
  return result;
};

const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

const generateZIP = () => {
  const zip = new JSZip();
  const normalizedFiles = getProcessedFiles(files);
  const folders = normalizedFiles.filter((file) => file.type === "FOLDER");
  const filesToDownload = normalizedFiles.filter(
    (file) => file.type === "FILE"
  );

  // first create all the necessary folders
  folders.forEach((folder) => {
    zip.folder(folder.path);
  });

  // promise array that download and fetch files as blob and adds it to zip
  const fileDownloadPromiseArr = filesToDownload.map((file) =>
    fetch(file.url)
      .then((res) => res.blob())
      .then((blob) => zip.file(file.path, blob))
  );

  Promise.all(fileDownloadPromiseArr).then(() => {
    zip.generateAsync({ type: "blob" }).then(function (content) {
      downloadBlob(content, "bundle.zip");
    });
  });
};

document
  .querySelector("#normal_download")
  .addEventListener("click", generateZIP);
