const { Octokit } = require("@octokit/rest");
const {env} = require ("process");
const token = env.INPUT_GITHUB_TOKEN
const repository = env.INPUT_REPOSITORY || env.GITHUB_REPOSITORY
const [owner, repo] = repository.split("/")

const octokit = new Octokit({
    auth: token
});
var res = octokit.repos.listTags({
  owner,
  repo
})
while(res){
     if(res.data){
        for (let key in res.data) {
            var tagdata = res.data[key]
            var tagname = tagdata.name
            var ref = "tags/" + tagname
            octokit.git.deleteRef({
              owner,
              repo,
              ref,
            });
        }
    }
    
    res = octokit.repos.listTags({
        owner,
        repo
    })
}

octokit.repos.listReleases({
    owner,
    repo
}).then(res => {
    if(!res.data){
        console.error("💡 No latest release found, skip delete.");
        return
    }
    
     for (let key in res.data) {
         console.error("find one data");
        var releasedata = res.data[key]
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
    
   
}).catch(
    err =>{
        if(err.status === 404){
            console.error("💡 No latest release found, skip delete.");
            return
        }
        console.error("❌ Can't get latest Release");
        console.error(err);
    }
)


