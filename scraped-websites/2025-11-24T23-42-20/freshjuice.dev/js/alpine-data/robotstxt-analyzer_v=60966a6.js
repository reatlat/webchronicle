(()=>{var a=(...e)=>{(location.hostname.match("local")||window.sessionStorage.unicorn)&&console.log("\u{1F984}:",...e)};document.addEventListener("alpine:init",()=>{Alpine.data("robotstxtAnalyzer",()=>({inputMode:"url",robotsText:"",robotsUrl:"",isLoading:!1,error:null,results:null,apiEndpoint:"https://api.freshjuice.dev/robotstxt-analyzer",get scoreCardClass(){let e=this.results?.summary?.score||0;return e>=90?"border-green-200 bg-green-50":e>=70?"border-blue-200 bg-blue-50":e>=50?"border-yellow-200 bg-yellow-50":"border-red-200 bg-red-50"},get scoreBadgeClass(){let e=this.results?.summary?.score||0;return e>=90?"border-green-300 bg-green-100 text-green-700":e>=70?"border-blue-300 bg-blue-100 text-blue-700":e>=50?"border-yellow-300 bg-yellow-100 text-yellow-700":"border-red-300 bg-red-100 text-red-700"},normalizeUrl(e){if(!e)return"";e=e.trim(),e.match(/^https?:\/\//i)||(e="https://"+e);try{let t=new URL(e);return`${t.protocol}//${t.host}/robots.txt`}catch(t){return a("URL parsing error:",t),e}},async analyzeRobotsTxt(){this.error=null,this.results=null,this.isLoading=!0;try{let e=this.inputMode==="text"?{text:this.robotsText}:{url:this.normalizeUrl(this.robotsUrl)};a("Analyzing robots.txt:",e);let t=await fetch(this.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),r=await t.json();if(!t.ok){this.error=r.detail||"An error occurred while analyzing",a("API error:",r);return}this.results=r,a("Analysis results:",r)}catch(e){a("Fetch error:",e),this.error="Failed to connect to the analyzer. Please check your connection and try again."}finally{this.isLoading=!1}},renderIssues(){if(!this.results?.issues)return"";let e=["critical","error","warning","medium","low","info"],t={};e.forEach(o=>{t[o]=this.results.issues.filter(l=>l.severity===o)});let r="";return e.forEach(o=>{let l=t[o];if(l.length===0)return;let n={critical:{label:"Critical",bgColor:"bg-red-50",borderColor:"border-red-300",textColor:"text-red-700",badgeClasses:"border-red-300 bg-red-50 text-red-700"},error:{label:"High",bgColor:"bg-orange-50",borderColor:"border-orange-300",textColor:"text-orange-700",badgeClasses:"border-orange-300 bg-orange-50 text-orange-700"},warning:{label:"Medium",bgColor:"bg-yellow-50",borderColor:"border-yellow-300",textColor:"text-yellow-700",badgeClasses:"border-yellow-300 bg-yellow-50 text-yellow-700"},medium:{label:"Medium",bgColor:"bg-yellow-50",borderColor:"border-yellow-300",textColor:"text-yellow-700",badgeClasses:"border-yellow-300 bg-yellow-50 text-yellow-700"},low:{label:"Low",bgColor:"bg-blue-50",borderColor:"border-blue-300",textColor:"text-blue-700",badgeClasses:"border-blue-300 bg-blue-50 text-blue-700"},info:{label:"Low",bgColor:"bg-blue-50",borderColor:"border-blue-300",textColor:"text-blue-700",badgeClasses:"border-blue-300 bg-blue-50 text-blue-700"}}[o];r+=`
          <div class="${n.bgColor} border-2 ${n.borderColor} rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs px-2 py-0.5 rounded-full border ${n.badgeClasses}">${n.label}</span>
              <span class="text-sm ${n.textColor}">${l.length} issue${l.length>1?"s":""}</span>
            </div>
            <div class="space-y-3">
              ${l.map(i=>`
                <div class="text-sm">
                  ${i.line?`<div class="font-mono text-xs text-gray-600 mb-1">Line ${i.line}</div>`:""}
                  <div class="font-medium ${n.textColor}">${this.escapeHtml(i.message)}</div>
                  ${i.recommendation?`<div class="text-gray-700 mt-1">${this.escapeHtml(i.recommendation)}</div>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `}),r},renderRules(){if(!this.results?.rules)return"";let e={};this.results.rules.forEach(r=>{e[r.userAgent]||(e[r.userAgent]=[]),e[r.userAgent].push(r)});let t="";return Object.entries(e).forEach(([r,o])=>{let l=r==="*"?`${r} (All Bots)`:r;t+=`
          <details class="border-2 border-gray-200 rounded-xl overflow-hidden">
            <summary class="cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2">
              <span class="text-gray-700">User-agent:</span>
              <span class="font-mono text-terminal">${this.escapeHtml(l)}</span>
              <span class="text-xs text-gray-500 ml-auto">${o.length} rule${o.length>1?"s":""}</span>
            </summary>
            <div class="px-4 py-3 space-y-2">
              ${o.map(s=>s.type==="allow"?`<div class="flex items-center gap-2 text-sm">
                      <span class="text-green-600">\u2713</span>
                      <span class="font-mono text-gray-700">Allow: ${this.escapeHtml(s.path)}</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${s.line}</span>
                    </div>`:s.type==="disallow"?`<div class="flex items-center gap-2 text-sm">
                      <span class="text-red-600">\u2717</span>
                      <span class="font-mono text-gray-700">Disallow: ${this.escapeHtml(s.path)}</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${s.line}</span>
                    </div>`:s.type==="crawl-delay"?`<div class="flex items-center gap-2 text-sm">
                      <span>\u23F1</span>
                      <span class="font-mono text-gray-700">Crawl-delay: ${s.value}s</span>
                      <span class="text-xs text-gray-500 ml-auto">Line ${s.line}</span>
                    </div>`:"").join("")}
            </div>
          </details>
        `}),t},escapeHtml(e){if(!e)return"";let t=document.createElement("div");return t.textContent=e,t.innerHTML},reset(){this.robotsText="",this.robotsUrl="",this.error=null,this.results=null,this.isLoading=!1,a("Robots.txt Analyzer reset")},init(){a("Robots.txt Analyzer initialized")}}))});})();
