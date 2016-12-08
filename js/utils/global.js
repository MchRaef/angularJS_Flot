/**
 * Created by Raef M on 11/25/2016.
 */
function loopOverFileContent(fileContent, perform){
    for(var key in fileContent[0]){
        for(var i = 0; i< fileContent.length; i++){
            perform(fileContent[i][key]);
        }
    }
}