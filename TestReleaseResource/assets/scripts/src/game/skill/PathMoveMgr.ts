import { Node } from "cc";

export class PathMoveMgr{

    static instance: PathMoveMgr;

    public static getInstance():PathMoveMgr{
        if(PathMoveMgr.instance == null){
            PathMoveMgr.instance = new PathMoveMgr();
        }
        return PathMoveMgr.instance;
    }

    
}