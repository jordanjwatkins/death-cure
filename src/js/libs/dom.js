/*function domReady(init) {
  document.addEventListener('DOMContentLoaded', init);
}*/

function find(selector, queryRoot) {
  queryRoot = queryRoot || document;

  return queryRoot.querySelectorAll(selector);
}

function findOne(selector, queryRoot) {
  queryRoot = queryRoot || document;

  return queryRoot.querySelectorAll(selector)[0];
}

/*function findId(selector) {
  return document.getElementById(selector);
}*/

function each(items, callback) {
  if (items[0]) {
    [].forEach.call(items, callback);
  } else {
    callback(items);
  }
}

function on(els, event, callback, options) {
  each(els, (el) => {
    if (el.addEventListener) {
      el.addEventListener(event, callback, options);
    }
  });
}

function off(els, event, callback) {
  each(els, (el) => {
    if (el.removeEventListener) {
      el.removeEventListener(event, callback);
    }
  });
}

/*function inArray(value, array) {
  return [].indexOf.call(array, value) > -1;
}*/

function onTap(els, callback, options = {}) {
  let touched = false;
  const tapCallback = handleTap();

  on(els, 'click', tapCallback, options);
  on(els, 'touchstart', tapCallback, options);

  return tapCallback;

  function handleTap() {
    return (event) => {
      if (options.once) offTap(els, tapCallback);

      // prevent click event event if triggering event was touchstart
      if (event.type === 'touchstart') {
        event.preventDefault();

        touched = true;
      } else if (touched === true) {
        touched = false;
      }

      callback(event);
    };
  }
}

function offTap(els, callback) {
  off(els, 'click', callback);
  off(els, 'touchstart', callback);
}

/*function fragment(htmlString) {
  const aFragment = document.createDocumentFragment();

  if (htmlString) {
    aFragment.innerHTML = htmlString;
  }

  return aFragment;
}*/

function make(htmlString) {
  const div = document.createElement('div');

  if (htmlString) {
    div.innerHTML = htmlString;
  }

  return div.childNodes[0];
}

/*function css(els, styles) {
  each(els, (el) => {
    Object.keys(styles).forEach((property) => {
      el.style[property] = styles[property];
    });
  });
}*/

export default {
  //ready: domReady,
  find,
  findOne,
  //findId,
  each,
  on,
  off,
  //inArray,
  onTap,
  //offTap,
  //fragment,
  make
  //css
};
