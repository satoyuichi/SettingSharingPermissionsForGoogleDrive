const FOLDERS_TOKEN = "FOLDERS_CONTINUATION_TOKEN";

const folder_name = PropertiesService.getScriptProperties().getProperty("FOLDER_NAME");
const owner_mail_address = PropertiesService.getScriptProperties().getProperty("OWNER_MAIL_ADDRESS");
const my_mail_address = PropertiesService.getScriptProperties().getProperty("MY_MAIL_ADDRESS");

let startTime;

function main() {
  startTime = new Date();
  const token = PropertiesService.getScriptProperties().getProperty(FOLDERS_TOKEN);
  let folders = token ? DriveApp.continueFolderIterator(token) : DriveApp.getFoldersByName(folder_name);

  try {
    while (folders.hasNext()) {
      let folder = folders.next();
      Logger.log(folder.getName());
    }
  }
  catch (e) {
    Logger.log(e);
  }
}

function saveFolderContinuationToken(folderIterator) {
  let currentTime = new Date();
  if ((currentTime - startTime) > 5 * 60 * 1000 ) {
    PropertiesService.getScriptProperties().deleteProperty(FOLDERS_TOKEN);
    let token = folderIterator.getContinuationToken();
    PropertiesService.getScriptProperties().setProperty(FOLDERS_TOKEN, token);

    throw new Error('Time out');
  }
}

function getSubFolder(folder) {
  let subfolders = folder.getFolders();

  if(subfolders) {
    while (subfolders.hasNext()) {
      let subfolder = subfolders.next();
      saveFolderContinuationToken(subfolders);
      getSubFolder(subfolder);
      changeOwner(subfolder, owner_mail_address);
    }
  }
}

function changeOwner(folder, owner) {
  if (folder.getOwner().getEmail() === my_mail_address) {
    Logger.log(folder.getName());
    folder.setOwner(owner);
  }

  let files = folder.getFiles();
  while (files.hasNext()) {
    let file = files.next();
    if (file.getOwner().getEmail() === my_mail_address) {
      Logger.log(file.getName());
      file.setOwner(owner);
    }
  }
}
