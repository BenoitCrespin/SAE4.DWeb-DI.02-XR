AFRAME.registerComponent('hit-pointer',{
    init:function(){
        this.el.addEventListener('click',(evt)=>{
            const point=evt.detail.intersection.point;
            const sceneEl=this.el.sceneEl;
            const marker = document.createElement('a-sphere');
            marker.setAttribute('position',point);
            marker.setAttribute('radius',0.05);
            marker.setAttribute('color','red');
            sceneEl.appendChild(marker);
            points.push(point);
        })
    },
    remove:function(){}
})