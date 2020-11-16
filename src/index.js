const { Octokit } = require("@octokit/rest");
const {env} = require ("process");
const token = env.INPUT_GITHUB_TOKEN
const repository = env.INPUT_REPOSITORY || env.GITHUB_REPOSITORY
const [owner, repo] = repository.split("/")

const octokit = new Octokit({
    auth: token
});

function findtagsAndRlese(){
    octokit.repos.listTags({
      owner,
      repo
    }).then(res => {
        if(res.data.length > 0){
            console.error("find  tags");
            deleteTags(res.data)
        }
    }).catch(
        err =>{
            if(err.status === 404){
                console.error("💡 No latest tag found, skip delete.");
            }else{
            console.error("❌ Can't get tag Release");
            console.error(err);
            }
        }
    )
    
    octokit.repos.listReleases({
      owner,
      repo
    }).then(res => {
        if(res.data.length > 0){
            console.error("find  tags");
            deleteRelease(res.data)
        }
    }).catch(
        err =>{
            if(err.status === 404){
                console.error("💡 No latest release found, skip delete.");
            }else{
            console.error("❌ Can't get latest Release");
            console.error(err);
            }
        }
    )
}

function deleteTags(tags){
     for (let key in tags) {
        console.error("find one tag");
        var tagdata = tags[key]
        var tagname = tagdata.name
        var ref = "tags/" + tagname
        octokit.git.deleteRef({
            owner,
            repo,
            ref,
        });
     }
}


function deleteRelease(releases){
   for (let key in releases) {
        console.error("find one release");
        var releasedata = releases[key]
        var release_id = releasedata.id
        octokit.repos.deleteRelease({
        owner,
        repo,
        release_id
        })
         if(!releasedata.assets)
         for (let assetskey in releasedata.assets) {
            var assetsdata = releasedata.assets[assetskey]
            var assetsdata_id = releasedata.id
             octokit.repos.deleteReleaseAsset({
                owner,
                repo,
                assetsdata_id
            })
         }
     }
    setTimeout(function(){
        findtagsAndRlese()
    },5000);
}

findtagsAndRlese()

