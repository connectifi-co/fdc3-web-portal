import { AppMetadata } from '@finos/fdc3';

export const guid = () : string => {
    const gen = (n?:number):string => {
        const rando = () : string => {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        };
        let r = "";
        let i = 0;
        n = n ? n : 1;
        while (i < n){
            r += rando();
            i++;
        }
        return r;
    }
    
    return `${gen(2)}-${gen()}-${gen()}-${gen()}-${gen(3)}`;
};


//convert a string target to an AppIdentifier 
export const targetToIdentifier = (
    target: String | AppMetadata | undefined,
  ): AppMetadata | undefined => {
    //is target just a string?  if so - treat it as name
    if (typeof target === 'string') {
      return { name: target };
    }
    return target as AppMetadata;
  };