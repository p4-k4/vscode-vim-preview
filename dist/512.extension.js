"use strict";exports.id=512,exports.ids=[512],exports.modules={512:(e,t,i)=>{i.r(t),i.d(t,{default:()=>c});const n=Symbol("singleComment"),o=Symbol("multiComment"),s=()=>"",l=(e,t,i)=>e.slice(t,i).replace(/\S/g," "),r=(e,t)=>{let i=t-1,n=0;for(;"\\"===e[i];)i-=1,n+=1;return Boolean(n%2)};function c(e,{whitespace:t=!0,trailingCommas:i=!1}={}){if("string"!=typeof e)throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof e}\``);const c=t?l:s;let f=!1,m=!1,u=0,g="",p="",a=-1;for(let t=0;t<e.length;t++){const s=e[t],l=e[t+1];if(m||'"'!==s||r(e,t)||(f=!f),!f)if(m||s+l!=="//"){if(m===n&&s+l==="\r\n"){t++,m=!1,g+=c(e,u,t),u=t;continue}if(m===n&&"\n"===s)m=!1,g+=c(e,u,t),u=t;else{if(!m&&s+l==="/*"){g+=e.slice(u,t),u=t,m=o,t++;continue}if(m===o&&s+l==="*/"){t++,m=!1,g+=c(e,u,t+1),u=t+1;continue}i&&!m&&(-1!==a?"}"===s||"]"===s?(g+=e.slice(u,t),p+=c(g,0,1)+g.slice(1),g="",u=t,a=-1):" "!==s&&"\t"!==s&&"\r"!==s&&"\n"!==s&&(g+=e.slice(u,t),u=t,a=-1):","===s&&(p+=g+e.slice(u,t),g="",u=t,a=t))}}else g+=e.slice(u,t),u=t,m=n,t++}return p+g+(m?c(e.slice(u)):e.slice(u))}}};