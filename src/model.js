export const number = value => typeof value === 'number' ? value : (/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(String(value).trim()) ? Number(String(value).trim().replace(',', '.')) : NaN);
export function root(fn, target, initial=1) {
  let low=0, high=initial;
  if (!(target>0 && initial>0 && Number.isFinite(target) && Number.isFinite(initial))) throw Error('Niepoprawne parametry solvera.');
  let bracket=false;
  for(let i=0;i<1024;i++) { const v=fn(high); if(!Number.isFinite(v)) throw Error('Przekroczono zakres liczbowy. Zmień parametry charakterystyk.'); if(v>=target){bracket=true;break;} high*=2; if(!Number.isFinite(high)) break; }
  if(!bracket) throw Error('Nie znaleziono przedziału rozwiązania.');
  for(let i=0;i<2048;i++){const mid=low+(high-low)/2, v=fn(mid); if(!Number.isFinite(v)) throw Error('Przekroczono zakres liczbowy.'); if(Math.abs(v-target)/target<=1e-9) return mid; if(v<target) low=mid; else high=mid;}
  throw Error('Nie osiągnięto wymaganej dokładności bilansu.');
}
export function flow(q, initial, branches){
  const pressure=root(p=>branches.reduce((s,b)=>s+(p/b.k)**(1/b.n),0),q,initial);
  const rows=branches.map(b=>({...b,q:(pressure/b.k)**(1/b.n)}));
  return {pressure,rows,total:rows.reduce((s,b)=>s+b.q,0),error:Math.abs(rows.reduce((s,b)=>s+b.q,0)-q)/q};
}
export function size(q,initial,branches,rho,ceff){
  const sum=branches.reduce((s,b)=>s+b.share,0);
  if(Math.abs(sum-100)>0.010000000001) throw Error('Suma udziałów musi wynosić 100% (tolerancja 0,01 p.p.).');
  const rows=branches.map(b=>({...b,share:b.share*100/sum,q:q*b.share/sum}));
  rows.forEach(b=>b.base=b.k*b.q**b.n);
  const pressure=Math.max(...rows.map(b=>b.base));
  if(!Number.isFinite(pressure) || pressure<=0) throw Error('Przekroczono zakres liczbowy charakterystyk.');
  rows.forEach(b=>{b.extra=pressure-b.base;if(b.extra<=pressure*1e-12)b.extra=0;b.c=b.ceff||ceff;b.kw=b.extra/b.q**2;b.d=b.extra>0?1000*Math.sqrt(4*(b.q/60000)/(Math.PI*b.c*Math.sqrt(2*b.extra*1000/rho))):null;b.status=!b.extra?'none':b.d>=b.diameter?'geometry':'ok';if(b.extra && !(Number.isFinite(b.d)&&b.d>0&&Number.isFinite(b.kw)))throw Error('Przekroczono zakres liczbowy zwężki.');});
  const combined=p=>rows.map(b=>{if(!p)return 0;let lo=0,hi=(p/b.k)**(1/b.n);for(let i=0;i<160;i++){let m=lo+(hi-lo)/2;if(b.k*m**b.n+b.kw*m*m>p)hi=m;else lo=m;}return (lo+hi)/2;});
  const checkedPressure=root(p=>combined(p).reduce((a,b)=>a+b,0),q,initial);
  const verified=combined(checkedPressure).map(v=>v/q*100);
  if(verified.some((v,i)=>!Number.isFinite(v)||Math.abs(v-rows[i].share)>0.01))throw Error('Nie udało się potwierdzić docelowego rozpływu.');
  return {pressure,rows,original:flow(q,initial,branches).pressure,normalized:Math.abs(sum-100)>1e-10,sum,verified,checkedPressure};
}
