const searchGiph=document.querySelector(".s-G"),inputKeydown=document.querySelector(".inputKey"),giphy=document.querySelector(".gif"),img=giphy.querySelectorAll("img");img.forEach(e=>{e.addEventListener("click",e=>{let r=e.currentTarget.src;localStorage.setItem("selectedImage",r),window.close()})});
// inputKeydown.addEventListener("input", () => {
//   if (inputKeydown.value.trim() === "") {
//     while (giphy.firstChild) {
//       giphy.removeChild(giphy.firstChild);
//     }
//   }
// });


