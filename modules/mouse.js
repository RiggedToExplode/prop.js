import $P from"https://riggedtoexplode.github.io/framework/prop.js";var mouse={left:!1,middle:!1,right:!1,pos:new $P.Coord(0,0)};window.addEventListener("mousedown",function(e){switch(e.button){case 0:mouse.left=!0;break;case 1:mouse.middle=!0;break;case 2:mouse.right=!0}},!1),window.addEventListener("mouseup",function(e){switch(e.button){case 0:mouse.left=!1;break;case 1:mouse.middle=!1;break;case 2:mouse.right=!1}},!1),window.addEventListener("mousemove",function(e){mouse.pos.x=e.clientX,mouse.pos.y=e.clientY},!1);export default mouse;