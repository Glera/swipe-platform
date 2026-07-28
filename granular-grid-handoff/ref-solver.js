var MAX_BODIES=4096,MAX_WALLS=256,GRID_W=64,GRID_H=64,GRID_TOTAL=GRID_W*GRID_H;
var posX=new Float32Array(MAX_BODIES),posY=new Float32Array(MAX_BODIES),prevX=new Float32Array(MAX_BODIES),prevY=new Float32Array(MAX_BODIES),radii=new Float32Array(MAX_BODIES),bodyIdArr=new Int32Array(MAX_BODIES),bodyCount=0,idToIndex={};
var wCX=new Float32Array(MAX_WALLS),wCY=new Float32Array(MAX_WALLS),wHW=new Float32Array(MAX_WALLS),wHH=new Float32Array(MAX_WALLS),wCos=new Float32Array(MAX_WALLS),wSin=new Float32Array(MAX_WALLS),wIsAA=new Uint8Array(MAX_WALLS),wallCount=0,wallIdToIdx={};
var cellCnt=new Uint16Array(GRID_TOTAL),cellOfs=new Int32Array(GRID_TOTAL),cellBuf=new Int32Array(MAX_BODIES*4),bodyCell=new Int32Array(MAX_BODIES);
function setGridSize(w,h){GRID_W=w;GRID_H=h;GRID_TOTAL=w*h;cellCnt=new Uint16Array(GRID_TOTAL);cellOfs=new Int32Array(GRID_TOTAL);}
var gx=0,gy=-10,dAir=0.25,dContact=0.01,iters=16,active=false,cSize=1,invCS=1,gOfsX=0,gOfsY=0,fixedDt=1.0/60.0,fixedDtSq=fixedDt*fixedDt,accumulator=0,bounceFactor=0.0,uniformR=0,uniformD=0,uniformDSq=0,useUniform=true;

function doInit(d){
  useUniform=(d.uniformRadius!==false);
  gx=d.gx;gy=d.gy;cSize=d.cellSize;invCS=1.0/d.cellSize;
  iters=d.iterations||16;
  dAir=(d.dampAir!==undefined&&d.dampAir!==0)?d.dampAir:0.25;
  dContact=(d.dampContact!==undefined&&d.dampContact!==0)?d.dampContact:0.01;
  if(d.gridW&&d.gridH)setGridSize(d.gridW,d.gridH);
  bodyCount=0;wallCount=0;idToIndex={};wallIdToIdx={};active=false;gOfsX=0;gOfsY=0;
}

function doAddBody(d){
  if(bodyCount>=MAX_BODIES)return;var i=bodyCount;
  posX[i]=d.x;posY[i]=d.y;prevX[i]=d.x;prevY[i]=d.y;
  radii[i]=d.radius;bodyIdArr[i]=d.id;
  idToIndex[d.id]=i;
  if(bodyCount===0){uniformR=d.radius;uniformD=d.radius*2;uniformDSq=uniformD*uniformD;}
  bodyCount++;
}

function doRemoveBody(d){
  var i=idToIndex[d.id];if(i===undefined)return;var last=bodyCount-1;
  if(i!==last){posX[i]=posX[last];posY[i]=posY[last];prevX[i]=prevX[last];prevY[i]=prevY[last];
  radii[i]=radii[last];bodyIdArr[i]=bodyIdArr[last];idToIndex[bodyIdArr[last]]=i;}
  delete idToIndex[d.id];bodyCount--;
}

function doAddWall(d){
  if(wallCount>=MAX_WALLS)return;var i=wallCount;
  wCX[i]=d.cx;wCY[i]=d.cy;wHW[i]=d.hw;wHH[i]=d.hh;wCos[i]=d.cosA;wSin[i]=d.sinA;
  wIsAA[i]=(d.cosA*d.cosA>0.9998)?1:0;
  wallIdToIdx[d.id]=i;wallCount++;
}

function doRemoveWall(d){
  var i=wallIdToIdx[d.id];
  if(i===undefined)return;var last=wallCount-1;
  if(i!==last){wCX[i]=wCX[last];wCY[i]=wCY[last];wHW[i]=wHW[last];wHH[i]=wHH[last];wCos[i]=wCos[last];wSin[i]=wSin[last];wIsAA[i]=wIsAA[last];
  for(var k in wallIdToIdx){if(wallIdToIdx[k]===last){wallIdToIdx[k]=i;break;}}}
  delete wallIdToIdx[d.id];wallCount--;
}

function doUpdateWall(d){
  var i=wallIdToIdx[d.id];if(i===undefined)return;
  wCX[i]=d.cx;wCY[i]=d.cy;wHW[i]=d.hw;wHH[i]=d.hh;wCos[i]=d.cosA;wSin[i]=d.sinA;
  wIsAA[i]=(d.cosA*d.cosA>0.9998)?1:0;
}

function doActivate(){
  if(bodyCount>0){var sx=0,sy=0;
  for(var i=0;i<bodyCount;i++){sx+=posX[i];sy+=posY[i];}
  gOfsX=sx/bodyCount-(GRID_W*cSize)*0.5;gOfsY=sy/bodyCount-(GRID_H*cSize)*0.5;}
  active=true;
}

function doSetIterations(d){iters=d.n;}
function doWakeAll(){}

function buildGrid(){
  var i,cx,cy,ci;
  for(i=0;i<GRID_TOTAL;i++)cellCnt[i]=0;
  for(i=0;i<bodyCount;i++){
    cx=((posX[i]-gOfsX)*invCS)|0;cy=((posY[i]-gOfsY)*invCS)|0;
    if(cx<0)cx=0;else if(cx>=GRID_W)cx=GRID_W-1;
    if(cy<0)cy=0;else if(cy>=GRID_H)cy=GRID_H-1;
    ci=cx+cy*GRID_W;bodyCell[i]=ci;cellCnt[ci]++;
  }
  cellOfs[0]=0;
  for(i=1;i<GRID_TOTAL;i++){cellOfs[i]=cellOfs[i-1]+cellCnt[i-1];}
  for(i=0;i<GRID_TOTAL;i++)cellCnt[i]=0;
  for(i=0;i<bodyCount;i++){
    ci=bodyCell[i];cellBuf[cellOfs[ci]+cellCnt[ci]]=i;cellCnt[ci]++;
  }
}

function solvePair(ia,ib){
  var dx=posX[ia]-posX[ib],dy=posY[ia]-posY[ib];
  var distSq=dx*dx+dy*dy;
  var minD,minDSq;
  if(useUniform){minDSq=uniformDSq;minD=uniformD;}
  else{minD=radii[ia]+radii[ib];minDSq=minD*minD;}
  if(distSq>=minDSq||distSq<0.0001)return;
  var dist=Math.sqrt(distSq),overlap=(minD-dist)*0.5;
  var nx=dx/dist,ny=dy/dist;
  posX[ia]+=nx*overlap;posY[ia]+=ny*overlap;
  posX[ib]-=nx*overlap;posY[ib]-=ny*overlap;
  var rvx=(posX[ia]-prevX[ia])-(posX[ib]-prevX[ib]);
  var rvy=(posY[ia]-prevY[ia])-(posY[ib]-prevY[ib]);
  var rvDotN=rvx*nx+rvy*ny;
  if(rvDotN<0){var imp=rvDotN*dContact;
    prevX[ia]+=nx*imp;prevY[ia]+=ny*imp;
    prevX[ib]-=nx*imp;prevY[ib]-=ny*imp;}
}

function solveWalls(){
  var w,i,contacted,vx,vy,cnx,cny,dx,dy,lx,ly,nearX,nearY,dlx,dly,dist,pen,lnx,lny,wnx,wny;
  var r,ext,hw,hh;
  for(i=0;i<bodyCount;i++){
    r=useUniform?uniformR:radii[i];
    contacted=0;cnx=0;cny=0;
    for(w=0;w<wallCount;w++){
      dx=posX[i]-wCX[w];dy=posY[i]-wCY[w];
      hw=wHW[w];hh=wHH[w];
      if(wIsAA[w]){
        if(dx<-(hw+r)||dx>(hw+r)||dy<-(hh+r)||dy>(hh+r))continue;
        nearX=dx<-hw?-hw:(dx>hw?hw:dx);
        nearY=dy<-hh?-hh:(dy>hh?hh:dy);
        dlx=dx-nearX;dly=dy-nearY;
        if(dlx===0&&dly===0){
          var dL=dx+hw,dR=hw-dx,dB=dy+hh,dT=hh-dy;
          var minE=dL;wnx=-1;wny=0;
          if(dR<minE){minE=dR;wnx=1;wny=0;}
          if(dB<minE){minE=dB;wnx=0;wny=-1;}
          if(dT<minE){wnx=0;wny=1;}
          posX[i]+=wnx*(minE+r);posY[i]+=wny*(minE+r);cnx+=wnx;cny+=wny;contacted=1;
        }else{
          dist=Math.sqrt(dlx*dlx+dly*dly);
          if(dist<r){pen=r-dist;wnx=dlx/dist;wny=dly/dist;
            posX[i]+=wnx*pen;posY[i]+=wny*pen;cnx+=wnx;cny+=wny;contacted=1;}
        }
      }else{
        ext=hw+hh+r;if(dx*dx+dy*dy>ext*ext)continue;
        lx=dx*wCos[w]+dy*wSin[w];ly=-dx*wSin[w]+dy*wCos[w];
        if(lx<-(hw+r)||lx>(hw+r)||ly<-(hh+r)||ly>(hh+r))continue;
        nearX=lx<-hw?-hw:(lx>hw?hw:lx);
        nearY=ly<-hh?-hh:(ly>hh?hh:ly);
        dlx=lx-nearX;dly=ly-nearY;
        if(dlx===0&&dly===0){
          var dL=lx+hw,dR=hw-lx,dB=ly+hh,dT=hh-ly;
          var minE=dL;lnx=-1;lny=0;
          if(dR<minE){minE=dR;lnx=1;lny=0;}
          if(dB<minE){minE=dB;lnx=0;lny=-1;}
          if(dT<minE){lnx=0;lny=1;}
          wnx=lnx*wCos[w]-lny*wSin[w];wny=lnx*wSin[w]+lny*wCos[w];
          posX[i]+=wnx*(minE+r);posY[i]+=wny*(minE+r);cnx+=wnx;cny+=wny;contacted=1;
        }else{
          dist=Math.sqrt(dlx*dlx+dly*dly);
          if(dist<r){pen=r-dist;lnx=dlx/dist;lny=dly/dist;
            wnx=lnx*wCos[w]-lny*wSin[w];wny=lnx*wSin[w]+lny*wCos[w];
            posX[i]+=wnx*pen;posY[i]+=wny*pen;cnx+=wnx;cny+=wny;contacted=1;}
        }
      }
    }
    if(contacted){var len=Math.sqrt(cnx*cnx+cny*cny);
      if(len>0.0001){cnx/=len;cny/=len;
        vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
        var vDotN=vx*cnx+vy*cny;
        if(vDotN<0){prevX[i]=posX[i]-(vx-cnx*vDotN*(1-dContact));
          prevY[i]=posY[i]-(vy-cny*vDotN*(1-dContact));}}}
  }
}

function enforceWalls(){
  var w,i,dx,dy,lx,ly,nearX,nearY,dlx,dly,dist,pen,lnx,lny,wnx,wny,vx,vy,vDotN;
  var r,ext,hw,hh;
  for(i=0;i<bodyCount;i++){
    r=useUniform?uniformR:radii[i];
    for(w=0;w<wallCount;w++){
      dx=posX[i]-wCX[w];dy=posY[i]-wCY[w];
      hw=wHW[w];hh=wHH[w];
      if(wIsAA[w]){
        if(dx<-(hw+r)||dx>(hw+r)||dy<-(hh+r)||dy>(hh+r))continue;
        nearX=dx<-hw?-hw:(dx>hw?hw:dx);
        nearY=dy<-hh?-hh:(dy>hh?hh:dy);
        dlx=dx-nearX;dly=dy-nearY;
        if(dlx===0&&dly===0){
          var dL=dx+hw,dR=hw-dx,dB=dy+hh,dT=hh-dy;
          var minE=dL;wnx=-1;wny=0;
          if(dR<minE){minE=dR;wnx=1;wny=0;}
          if(dB<minE){minE=dB;wnx=0;wny=-1;}
          if(dT<minE){wnx=0;wny=1;}
          posX[i]+=wnx*(minE+r);posY[i]+=wny*(minE+r);
          vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
          vDotN=vx*wnx+vy*wny;
          if(vDotN<0){prevX[i]=posX[i]-(vx-wnx*vDotN);prevY[i]=posY[i]-(vy-wny*vDotN);}
        }else{
          dist=Math.sqrt(dlx*dlx+dly*dly);
          if(dist<r){pen=r-dist;wnx=dlx/dist;wny=dly/dist;
            posX[i]+=wnx*pen;posY[i]+=wny*pen;
            vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
            vDotN=vx*wnx+vy*wny;
            if(vDotN<0){prevX[i]=posX[i]-(vx-wnx*vDotN);prevY[i]=posY[i]-(vy-wny*vDotN);}}
        }
      }else{
        ext=hw+hh+r;if(dx*dx+dy*dy>ext*ext)continue;
        lx=dx*wCos[w]+dy*wSin[w];ly=-dx*wSin[w]+dy*wCos[w];
        if(lx<-(hw+r)||lx>(hw+r)||ly<-(hh+r)||ly>(hh+r))continue;
        nearX=lx<-hw?-hw:(lx>hw?hw:lx);
        nearY=ly<-hh?-hh:(ly>hh?hh:ly);
        dlx=lx-nearX;dly=ly-nearY;
        if(dlx===0&&dly===0){
          var dL=lx+hw,dR=hw-lx,dB=ly+hh,dT=hh-ly;
          var minE=dL;lnx=-1;lny=0;
          if(dR<minE){minE=dR;lnx=1;lny=0;}
          if(dB<minE){minE=dB;lnx=0;lny=-1;}
          if(dT<minE){lnx=0;lny=1;}
          wnx=lnx*wCos[w]-lny*wSin[w];wny=lnx*wSin[w]+lny*wCos[w];
          posX[i]+=wnx*(minE+r);posY[i]+=wny*(minE+r);
          vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
          vDotN=vx*wnx+vy*wny;
          if(vDotN<0){prevX[i]=posX[i]-(vx-wnx*vDotN);prevY[i]=posY[i]-(vy-wny*vDotN);}
        }else{
          dist=Math.sqrt(dlx*dlx+dly*dly);
          if(dist<r){pen=r-dist;lnx=dlx/dist;lny=dly/dist;
            wnx=lnx*wCos[w]-lny*wSin[w];wny=lnx*wSin[w]+lny*wCos[w];
            posX[i]+=wnx*pen;posY[i]+=wny*pen;
            vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
            vDotN=vx*wnx+vy*wny;
            if(vDotN<0){prevX[i]=posX[i]-(vx-wnx*vDotN);prevY[i]=posY[i]-(vy-wny*vDotN);}}
        }
      }
    }
  }
}

function solveConstraints(){
  var iter,cx,cy,ci,ni,s,e,ns,ne,a,b;
  for(iter=0;iter<iters;iter++){
    solveWalls();
    for(cy=0;cy<GRID_H;cy++){
      for(cx=0;cx<GRID_W;cx++){
        ci=cx+cy*GRID_W;s=cellOfs[ci];e=s+cellCnt[ci];
        for(a=s;a<e;a++){for(b=a+1;b<e;b++){solvePair(cellBuf[a],cellBuf[b]);}}
        if(cx+1<GRID_W){ni=(cx+1)+cy*GRID_W;ns=cellOfs[ni];ne=ns+cellCnt[ni];
          for(a=s;a<e;a++){for(b=ns;b<ne;b++){solvePair(cellBuf[a],cellBuf[b]);}}}
        if(cy+1<GRID_H){
          ni=cx+(cy+1)*GRID_W;ns=cellOfs[ni];ne=ns+cellCnt[ni];
          for(a=s;a<e;a++){for(b=ns;b<ne;b++){solvePair(cellBuf[a],cellBuf[b]);}}
          if(cx+1<GRID_W){ni=(cx+1)+(cy+1)*GRID_W;ns=cellOfs[ni];ne=ns+cellCnt[ni];
            for(a=s;a<e;a++){for(b=ns;b<ne;b++){solvePair(cellBuf[a],cellBuf[b]);}}}
          if(cx-1>=0){ni=(cx-1)+(cy+1)*GRID_W;ns=cellOfs[ni];ne=ns+cellCnt[ni];
            for(a=s;a<e;a++){for(b=ns;b<ne;b++){solvePair(cellBuf[a],cellBuf[b]);}}}
        }
      }
    }
  }
}

function doTick(){
  var i,vx,vy;
  for(i=0;i<bodyCount;i++){
    vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
    prevX[i]=posX[i];prevY[i]=posY[i];
    posX[i]+=vx+gx*fixedDtSq;posY[i]+=vy+gy*fixedDtSq;
  }
  buildGrid();solveConstraints();
  var maxSpd=cSize*0.5,maxSpdSq=maxSpd*maxSpd,speedSq;
  for(i=0;i<bodyCount;i++){
    vx=posX[i]-prevX[i];vy=posY[i]-prevY[i];
    speedSq=vx*vx+vy*vy;
    if(speedSq>maxSpdSq){var sc=maxSpd/Math.sqrt(speedSq);vx*=sc;vy*=sc;}
    prevX[i]=posX[i]-vx*dAir;prevY[i]=posY[i]-vy*dAir;
  }
  enforceWalls();
}

function doStep(dt){
  if(!active)return;
  if(dt<=0||dt>0.1)dt=0.02;
  accumulator+=dt;if(accumulator>0.1)accumulator=0.1;
  while(accumulator>=fixedDt){doTick();accumulator-=fixedDt;}
}

self.onmessage=function(ev){
  var m=ev.data;
  switch(m.cmd){
    case "init":doInit(m);break;
    case "addBody":doAddBody(m);break;
    case "removeBody":doRemoveBody(m);break;
    case "addWall":doAddWall(m);break;
    case "removeWall":doRemoveWall(m);break;
    case "updateWall":doUpdateWall(m);break;
    case "activate":doActivate();break;
    case "setIterations":doSetIterations(m);break;
    case "wakeAll":doWakeAll();break;
    case "batch":
      for(var bc=0;bc<m.cmds.length;bc++){var c=m.cmds[bc];
        switch(c.cmd){
          case "removeWall":doRemoveWall(c);break;
          case "addWall":doAddWall(c);break;
          case "updateWall":doUpdateWall(c);break;
          case "setIterations":doSetIterations(c);break;
          case "wakeAll":doWakeAll();break;
        }
      }
      break;
    case "step":
      doStep(m.dt);
      var p=new Float32Array(bodyCount*3);
      for(var i=0;i<bodyCount;i++){var o=i*3;p[o]=bodyIdArr[i];p[o+1]=posX[i];p[o+2]=posY[i];}
      var v=new Float32Array(bodyCount);
      for(var i=0;i<bodyCount;i++){v[i]=posY[i]-prevY[i];}
      self.postMessage({cmd:"stepDone",positions:p,velocitiesY:v,bodyCount:bodyCount},[p.buffer,v.buffer]);
      break;
    case "getCountInBox":
      var cnt=0;
      for(var i=0;i<bodyCount;i++){if(posX[i]>=m.minX&&posX[i]<=m.maxX&&posY[i]>=m.minY&&posY[i]<=m.maxY)cnt++;}
      self.postMessage({cmd:"countInBox",count:cnt});
      break;
    case "getCountBelowY":
      var cnt2=0;
      for(var i=0;i<bodyCount;i++){if(posY[i]<m.y)cnt2++;}
      self.postMessage({cmd:"countBelowY",count:cnt2});
      break;
  }
};
self.postMessage({cmd:"ready"});