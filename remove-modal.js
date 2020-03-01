(() => {
  //prettier-ignore
  const standardHTMLElements = ["iframe","head","link","title","meta","script","style","body","div","header","nav","button","svg","path","a","ul","li","span","circle","fbs-ad","main","section","h3","h1","h5","h6","p","h2","h4","canvas","footer","img","form","input","noscript","option","navbar","strong","em","label","select","video","small","i","nav","article","legend", "ol", "aside", "figure", "figcaption"];

  const getAllCustomWebComponentNodes = () => {
    const uniqueElementsSet = new Set();
    const allElems = document.querySelectorAll("html /deep/ *");
    const nodeNames = [].map
      .call(allElems, el => el.nodeName.toLowerCase())
      .forEach(value => {
        if (!standardHTMLElements.includes(value)) {
          uniqueElementsSet.add(value);
        }
      });
    return [...uniqueElementsSet].reduce((acc, value) => {
      return [...acc, ...document.getElementsByTagName(value)];
    }, []);
  };

  /* 
  MARK: -
  Find the highest z-index element on the page 
  and hide the element and any others at that z-index,
  these elements are likely the modal and elements
  blocking the page's content
  */

  const divs = [...document.getElementsByTagName("div")];
  const customWebComponents = getAllCustomWebComponentNodes();
  const elementsToCheck = [...divs, ...customWebComponents];

  const maxZIndex = elementsToCheck.reduce((maxZIndex, el) => {
    const { zIndex, display, visibility } = window.getComputedStyle(el);

    const { height, width } = el.getBoundingClientRect();
    const currentZIndex = +zIndex || 0;

    // Magic numbers, we assume the modal must be at least this large
    const meetsMinimumModalDimensions = height > 150 && width > 150;
    const isVisible = display !== "none" && visibility !== "hidden";
    const meetsStyleRequirements = isVisible && meetsMinimumModalDimensions;
    const isNewHighestDiv = currentZIndex > maxZIndex;

    return isNewHighestDiv && meetsStyleRequirements ? zIndex : maxZIndex;
  }, 0);

  const highestElements = elementsToCheck.filter(element => {
    return window.getComputedStyle(element).zIndex === maxZIndex;
  });

  highestElements.forEach(element => {
    element.setAttribute("style", "display: none !important");
  });

  /* 
  MARK: -
  Do the easy fixes first to try to re-enable
  scrolling and user interaction on the page
  */

  const [html] = document.getElementsByTagName("html");
  const [body] = document.getElementsByTagName("body");
  html.setAttribute(
    "style",
    "overflow:auto !important; position:static !important"
  );
  body.setAttribute("style", "overflow:auto !important");

  /* 
  MARK: -
  Remove any potential classes on the html and body elements
  that could be adding other blocking styles
  */

  const classNamesToAvoid = ["open", "modal", "message", "no-touch"];
  const classListIndexes = classList => {
    return [...classList].reduce((acc, classText, index) => {
      const classContainsWordToAvoid =
        classText.includes("open") ||
        classText.includes("modal") ||
        classText.includes("message") ||
        classText.includes("no-touch");
      return classContainsWordToAvoid ? [...acc, index] : acc;
    }, []);
  };

  const htmlBadClassIndexes = classListIndexes(html.classList);
  if (htmlBadClassIndexes.length) {
    htmlBadClassIndexes.forEach(index => {
      html.classList.remove(html.classList[index]);
    });
  }

  const bodyBadClassIndexes = classListIndexes(body.classList);
  if (bodyBadClassIndexes.length) {
    bodyBadClassIndexes.forEach(index => {
      body.classList.remove(body.classList[index]);
    });
  }

  /* 
  MARK: -
  Site specific logic
  */

  const url = window.location.href;

  // Forbes is smarter than the avergae site, need some custom logic
  if (url.includes("forbes.com")) {
    const [page] = [...document.getElementsByTagName("page-standard")];
    page.setAttribute("style", "position:inherit !important");

    // they have some sneaky ads that get past the ad blocker
    const ads = [
      ...document.getElementsByTagName("fbs-ad"),
      ...document.getElementsByTagName("amp-img")
    ];
    ads.forEach(ad => {
      ad.setAttribute("style", "display: none !important");
    });
  }
})();
