const FOLDERS_TOKEN = "FOLDERS_CONTINUATION_TOKEN";

const folder_name = PropertiesService.getScriptProperties().getProperty("FOLDER_NAME");
const owner_mail_address = PropertiesService.getScriptProperties().getProperty("OWNER_MAIL_ADDRESS");
const my_mail_address = PropertiesService.getScriptProperties().getProperty("MY_MAIL_ADDRESS");

function main() {
  const token = PropertiesService.getScriptProperties().getProperty(FOLDERS_TOKEN);
  const folders = token ? DriveApp.continueFolderIterator(token) : DriveApp.getFoldersByName(folder_name);
  
  while (folders.hasNext()) {
    saveFolderContinuationToken(folders);

    let folder = folders.next();
    Logger.log(folder.getName());

    getSubFolder(folder);
  }  
}

function saveFolderContinuationToken(folder) {
  let token = folder.getContinuationToken();
  PropertiesService.getScriptProperties().setProperty(FOLDERS_TOKEN, token);
}

function getSubFolder(folder) {
  let subfolders = folder.getFolders();

  if(subfolders) {
    while (subfolders.hasNext()) {
      saveFolderContinuationToken(subfolders);

      let subfolder = subfolders.next();
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
