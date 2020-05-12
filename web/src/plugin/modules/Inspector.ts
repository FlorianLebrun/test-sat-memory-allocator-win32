
export interface Inspector {
  fetchAPI(url: string, options: any): Promise<any>
}
