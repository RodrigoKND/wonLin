const imgSelect=document.getElementById("img-select"),button=document.querySelector(".button");button.addEventListener("click",()=>{window.open("/giphPresentation","_blank","height=500, width=500, left=200, top=150")});const element=e=>document.querySelector(e),elementList=e=>document.querySelectorAll(e),selectedImage=localStorage.getItem("selectedImage");if(null!==selectedImage){let e=document.createElement("img");e.className="mt-3",e.height="200",e.width="300",e.src=selectedImage,imgSelect.appendChild(e),imgSelect.addEventListener("click",t=>{let n=confirm("Do you want to delete this gif?");n&&(localStorage.removeItem("selectedImage"),e.remove())})}const nav_LINK=elementList(".nav_link");nav_LINK.forEach(e=>{let t=e.getAttribute("href");return""===t?e.remove():""});const containerCards=document.querySelector(".containerCards"),hijos=containerCards.children,listaHijos=[];for(let i=0;i<hijos.length;i++)listaHijos.push(hijos[i]);function generateActionList(e){let t=`
                <li class="bg-success btn text-white">
                    <a class="nav-link" href=/post/update/${e} rel="noreferrer">Update</a>
                </li>
                <form method="post" action="/remove/${e}">
                    <button class="btn text-danger bg-light">Remove</button>
                </form>
                `,n=document.createElement("ul");return n.classList.add("list-group","list_action"),n.innerHTML=t,n}function handleButtonClick(e){let t=e.currentTarget,n=t.closest(".card_group"),r=n.getAttribute("id"),l=t.dataset.clickCount?parseInt(t.dataset.clickCount):0;if(++l>=2){let o=t.nextElementSibling;o&&o.remove(),l=0}else{let s=generateActionList(r);t.insertAdjacentElement("afterend",s)}t.dataset.clickCount=l}listaHijos.reverse().forEach(e=>{containerCards.insertAdjacentElement("beforeend",e)});const btnDots=elementList(".btnDots");btnDots.forEach(e=>{e.addEventListener("click",handleButtonClick)});const btnExit=element(".exit"),portf=element(".portf");btnExit.addEventListener("click",()=>{let e=portf.children,t=[];for(let n=0;n<e.length;n++)t.push(e[n]);t.forEach(e=>{"IMG"===e.tagName&&(e.remove(),portf.classList.remove("bgPortfolio"),element(".exit").setAttribute("hidden","h"),element(".export").setAttribute("hidden","h"))})});const imgCard=document.querySelectorAll(".imgCard");imgCard.forEach(e=>{let t=e.getAttribute("src");t&&document.querySelector(".sh_P").removeAttribute("disabled")});