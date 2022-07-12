import { asserts } from "./devdeps.ts";
import { sequenceNumberToName } from "./sequenceNumberToName.ts";

Deno.test("sequenceNumberToName", () => {
  let sequenceNumber = -5;
  let res = "";
  while (sequenceNumber < 100) {
    sequenceNumber++;
    const name = sequenceNumberToName(sequenceNumber);
    res = res ? `${res},${name}` : name;
  }
  asserts.assertEquals(
    "d_,c_,b_,a_,_,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a_,aa,ab,ac,ad,ae,af,ag,ah,ai,aj,ak,al,am,an,ao,ap,aq,ar,as,at,au,av,aw,ax,ay,az,aA,aB,aC,aD,aE,aF,aG,aH,aI,aJ,aK,aL,aM,aN,aO,aP,aQ,aR,aS,aT,aU",
    res,
  );
});
