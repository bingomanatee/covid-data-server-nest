import { Injectable } from '@nestjs/common';
const GitHub = require('github-api');
const dayjs = require('dayjs');
import {Tree} from './interfaces/tree.interface';

let files = [];
let lastLoadTime = null;

const cred = {
    username: 'dave@wonderlandlabs.com', password: process.env.GITHUB_PASS
};

// unauthenticated client
@Injectable()
export class GithubCsvService {
    
    private gh: any;
    private repo: any;
    private files: Array<Tree>;
    public lastLoadTime: any;
    
    constructor(){
        this.gh = new GitHub(cred);
        this.repo = this.gh.getRepo('Lucas-Czarnecki', 'COVID-19-CLEANED-JHUCSSE');
        this.files = [];
    }
    
   public async climbTree(path : string|Array<string>, tree: Tree) : Promise<Array<Tree>> {
        if (!Array.isArray(path)) {
            return this.climbTree(path.split('/'), tree);
        }
        
        console.log('tree is ', tree);
        const {sha} = tree;
        
        const {data} = await this.repo.getTree(sha);
        if (!path.length) return data.tree;
        
        let dir = path.shift();
        
        const subTree = data.tree.find((t) => t.path === dir);
        if (!subTree) {
            console.log('cannot find ', dir, 'in', data.tree, '(remaining: ', path, ')');
            return null;
        }
        
        return this.climbTree(path, subTree);
    }
    
    public useCache() {
        return this.lastLoadTime && this.lastLoadTime.diff(dayjs(), 'minutes') < 5;
    }
    
    public async getFiles() : Promise<Array<Tree>>{
      if (!this.useCache()) await this.loadFiles();
      return this.files;
    }
    
    private async loadFiles() {
      const {data: branch} = await this.repo.getBranch('master');
      
      const {
        commit: {
            commit : {tree}
        }
      } = branch;
      
      const subTree = await this.climbTree('COVID-19_CLEAN/csse_covid_19_clean_data', tree);
      this.files = subTree.filter((t) => /^CSSE_DailyReports.*csv$/.test(t.path));
      this.lastLoadTime = dayjs();
    };
}