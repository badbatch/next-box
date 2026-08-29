export interface ClientFilter<P extends object> {
  name: string;
  resolve: (params: P) => boolean;
}
