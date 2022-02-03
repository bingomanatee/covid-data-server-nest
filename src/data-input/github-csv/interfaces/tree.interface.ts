
export interface Tree {
    path: string,
    sha: string, 
    tree: Array<Tree> | null,
    url?: string,
    size?: number
}