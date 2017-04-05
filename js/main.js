/**
 * Scripts for Assignment1b
 *
 * author: Joshua Bauer s263364
 * email: joshybee@gmail.com
 * website: https://jaybeebauer.github.io/jaybeestyleguide
 *
 */
  ;(function() { //Polyfill for ClassList https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca
     // helpers
     var regExp = function(name) {
         return new RegExp('(^| )'+ name +'( |$)');
     };
     var forEach = function(list, fn, scope) {
         for (var i = 0; i < list.length; i++) {
             fn.call(scope, list[i]);
         }
     };

     // class list object with basic methods
     function ClassList(element) {
         this.element = element;
     }

     ClassList.prototype = {
         add: function() {
             forEach(arguments, function(name) {
                 if (!this.contains(name)) {
                     this.element.className += ' '+ name;
                 }
             }, this);
         },
         remove: function() {
             forEach(arguments, function(name) {
                 this.element.className =
                     this.element.className.replace(regExp(name), '');
             }, this);
         },
         toggle: function(name) {
             return this.contains(name)
                 ? (this.remove(name), false) : (this.add(name), true);
         },
         contains: function(name) {
             return regExp(name).test(this.element.className);
         },
         // bonus..
         replace: function(oldName, newName) {
             this.remove(oldName), this.add(newName);
         }
     };

     // IE8/9, Safari
     if (!('classList' in Element.prototype)) {
         Object.defineProperty(Element.prototype, 'classList', {
             get: function() {
                 return new ClassList(this);
             }
         });
     }

     // replace() support for others
     if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
         DOMTokenList.prototype.replace = ClassList.prototype.replace;
     }
 })();

 (function() { //Polyfill for addEventListener https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca
   if (!Event.prototype.preventDefault) {
     Event.prototype.preventDefault=function() {
       this.returnValue=false;
     };
   }
   if (!Event.prototype.stopPropagation) {
     Event.prototype.stopPropagation=function() {
       this.cancelBubble=true;
     };
   }
   if (!Element.prototype.addEventListener) {
     var eventListeners=[];

     var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
       var self=this;
       var wrapper=function(e) {
         e.target=e.srcElement;
         e.currentTarget=self;
         if (typeof listener.handleEvent != 'undefined') {
           listener.handleEvent(e);
         } else {
           listener.call(self,e);
         }
       };
       if (type=="DOMContentLoaded") {
         var wrapper2=function(e) {
           if (document.readyState=="complete") {
             wrapper(e);
           }
         };
         document.attachEvent("onreadystatechange",wrapper2);
         eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

         if (document.readyState=="complete") {
           var e=new Event();
           e.srcElement=window;
           wrapper2(e);
         }
       } else {
         this.attachEvent("on"+type,wrapper);
         eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
       }
     };
     var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
       var counter=0;
       while (counter<eventListeners.length) {
         var eventListener=eventListeners[counter];
         if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
           if (type=="DOMContentLoaded") {
             this.detachEvent("onreadystatechange",eventListener.wrapper);
           } else {
             this.detachEvent("on"+type,eventListener.wrapper);
           }
           eventListeners.splice(counter, 1);
           break;
         }
         ++counter;
       }
     };
     Element.prototype.addEventListener=addEventListener;
     Element.prototype.removeEventListener=removeEventListener;
     if (HTMLDocument) {
       HTMLDocument.prototype.addEventListener=addEventListener;
       HTMLDocument.prototype.removeEventListener=removeEventListener;
     }
     if (Window) {
       Window.prototype.addEventListener=addEventListener;
       Window.prototype.removeEventListener=removeEventListener;
     }
   }
 })();

(function() {
    //We'll setup an object so it's easier to get and set form data and some variables
    var form = new formData();
    var isFormPage;
    var isPastData;

    //Make indexOf supported for IE5.5 through 8
    confirmIndexOfFeature()
    //Setup page and menu item for accessibility.html
    setupPage();
    //Load data from broswer storage if it exists
    loadStorageData();
    //Setup page with user settings and load form data into form if available
    setUserSettings();

    //Form data constructor idea from https://modernweb.com/45-useful-javascript-tips-tricks-and-best-practices/
    function formData(uName, uEmail, isInvert, fontColour, uFont) {
        this.uName = uName;
        this.uEmail = uEmail;
        this.isInvert = isInvert;
        this.fontColour = fontColour;
        this.uFont = uFont;
    }

    //If we've made it this far Javascript is working, lets setup page and navigation to get to accessibility and options page
    function setupPage() {
        if (document.URL.indexOf("accessibility.html") >= 0) {
            isFormPage = true;
        }

        var ul = document.getElementsByClassName('nav__list');
        var li = document.createElement('li');
        if (isFormPage) {
            li.setAttribute('class', 'nav__item nav__item--current'); //If current page is accessibility.html then set the item--current class
        } else {
            li.setAttribute('class', 'nav__item');
        }
        var liUrl = document.createElement('a');
        liUrl.setAttribute('href', 'accessibility.html');
        liUrl.setAttribute('class', 'nav__link');
        liUrlText = document.createTextNode("Accessibility");
        liUrl.appendChild(liUrlText);
        li.appendChild(liUrl);
        ul[0].appendChild(li);

        //Lets check if this is the accessibility.html or not to see if we setup the form
        if (isFormPage) {
            //Get buttons
            var saveBtn = document.getElementById('save');
            var resetBtn = document.getElementById('resetdatabase');
            var nameField = document.getElementById('name');
            var emailField = document.getElementById('email');
            var hexField = document.getElementById('fontcolour');

            //Setup button event handlers
            saveBtn.addEventListener('click', storeFormData);
            resetBtn.addEventListener('click', resetDatabaseData);
            nameField.addEventListener('blur', function() { //blur event lisenter https://www.w3schools.com/jsref/event_onblur.asp
              if (this.value == null || this.value == "") {
                fieldError(this, "Please enter a name");
              }
              else {
                fieldSuccess(this);
              }
            });
            emailField.addEventListener('blur', function() {
              if (this.value == null || this.value == "") {
                  fieldError(this, "Please enter an email address");
              } else {
                  if (!validEmail(this.value)) {
                      fieldError(this, "Please enter a valid email address");
                  }
                  else {
                    fieldSuccess(this);
                  }
              }

            });
            hexField.addEventListener('blur', function() {
              if (this.value == null || this.value == "") {
                  fieldError(this, "Please enter a hex font colour");
              } else {
                  if (!validHexColour(this.value)) {
                      fieldError(this, "Please enter a valid hex colour");
                  }
                  else {
                    fieldSuccess(this);
                  }
              }
            });


        }
    }

    function fieldError(obj, errortext){
      obj.nextSibling.nextSibling.setAttribute('class', 'form__fielderror'); //https://developer.mozilla.org/en-US/docs/Web/API/Node/nextSibling
      obj.nextSibling.nextSibling.innerHTML = errortext;
      obj.style.borderColor = 'red';
    }

    function fieldSuccess(obj){
      obj.nextSibling.nextSibling.setAttribute('class', '');
      obj.nextSibling.nextSibling.innerHTML = "";
      obj.style.borderColor = '';
    }

    function storeFormData(event) {
        event.preventDefault(); //Putting this in just to be safe informed from class
        //Get field values from form
        form.uName = document.getElementById('name').value;
        form.uEmail = document.getElementById('email').value;
        form.isInvert = document.querySelector('input[name="invertcolour"]:checked').value;
        form.fontColour = document.getElementById('fontcolour').value;
        form.uFont = document.querySelector('input[name="font"]:checked').value;

        //If data is all valid lets update the constructor and make the changes to the page
        if (validateFormData()) {
            localStorage.setItem('uName', form.uName);
            localStorage.setItem('uEmail', form.uEmail);
            localStorage.setItem('isInvert', form.isInvert);
            if (localStorage.getItem('isInvert') == "true") {
                document.documentElement.classList.add("invert");
            }
            if (localStorage.getItem('isInvert') == "false") {
                document.documentElement.classList.remove("invert");
            }
            localStorage.setItem('fontColour', form.fontColour);
            document.styleSheets[0].rules[15].styleSheet.rules[3].style.color = form.fontColour;
            localStorage.setItem('uFont', form.uFont);
            if (form.uFont != "nuitosans") {
                document.querySelector('body').className = "";
                document.querySelector('body').classList.add(form.uFont);
            }
        }
    }

    //Function to validate form data idea for operators from https://www.w3schools.com/js/js_comparisons.asp
    function validateFormData() {
        if (form.uName == null || form.uName == "") {
            return false;
        }
        if (form.uEmail == null || form.uEmail == "") {
            return false;
        } else {
            if (!validEmail(form.uEmail)) {
                return false;
            }
        }
        if (form.fontColour == null || form.fontColour == "") {
            return false;
        } else {
            if (!validHexColour(form.fontColour)) {
                return false;
            }
        }
        return true;
    }

    //If there is any data already lets load it
    function loadStorageData() {
        if (localStorage.length != 0) {
            if (localStorage.getItem('uName')) {
                form.uName = localStorage.getItem('uName');
            }
            if (localStorage.getItem('uEmail')) {
                form.uEmail = localStorage.getItem('uEmail');
            }
            if (localStorage.getItem('isInvert')) {
                form.isInvert = localStorage.getItem('isInvert');
            }
            if (localStorage.getItem('fontColour')) {
                form.fontColour = localStorage.getItem('fontColour');
            }
            if (localStorage.getItem('uFont')) {
                form.uFont = localStorage.getItem('uFont');
            }
            isPastData = true; //Tell the rest of the script there is data
        } else {
            isPastData = false;
        }
    }

    //If there is data already in storage lets load it and input values into the form (if on the form page)
    function setUserSettings() {
        if (isPastData) {
            if (isFormPage) {
                document.getElementById('name').value = form.uName;
                document.getElementById('email').value = form.uEmail;
                document.getElementById(form.isInvert).checked = true;
                document.getElementById('fontcolour').value = form.fontColour;
                document.getElementById(form.uFont).checked = true;
            }
            if (form.isInvert == "true") {
                document.documentElement.classList.add("invert")
            }
            document.styleSheets[0].rules[15].styleSheet.rules[3].style.color = form.fontColour; //This goes into the import rule list and finds the class file we need then finds the rule in that class file .fontcolour then adds the new colour
            if (form.uFont != "nuitosans") {
                document.querySelector('body').className = "";
                document.querySelector('body').classList.add(form.uFont);
            }
        }
    }

    function resetDatabaseData(event) {
        event.preventDefault(); //Putting this in just to be safe informed from class
        localStorage.clear(); //Clear browser databases
        document.getElementById('form').reset(); //clear all fields in form
        document.getElementById('name').focus(); //Set focus back to the first field, name
        document.documentElement.classList.remove("invert");
        document.styleSheets[0].rules[15].styleSheet.rules[3].style.color = ""; //Removes new font colour from .fontcolour in accessibility.css
        fieldSuccess(document.getElementById('name'));
        fieldSuccess(document.getElementById('email'));
        fieldSuccess(document.getElementById('fontcolour'));
    }

    //Validates email address, regex from http://www.regular-expressions.info/email.html
    function validEmail(email) {
        var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(email);
    }

    //Validates hex colour, regex from https://www.mkyong.com/regular-expressions/how-to-validate-hex-color-code-with-regular-expression/
    function validHexColour(colour) {
        var reg = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return reg.test(colour);
    }

    function confirmIndexOfFeature(){ //Polyfill for indexOf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
      // Production steps of ECMA-262, Edition 5, 15.4.4.14
      // Reference: http://es5.github.io/#x15.4.4.14
      if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {

          var k;

          // 1. Let o be the result of calling ToObject passing
          //    the this value as the argument.
          if (this == null) {
            throw new TypeError('"this" is null or not defined');
          }

          var o = Object(this);

          // 2. Let lenValue be the result of calling the Get
          //    internal method of o with the argument "length".
          // 3. Let len be ToUint32(lenValue).
          var len = o.length >>> 0;

          // 4. If len is 0, return -1.
          if (len === 0) {
            return -1;
          }

          // 5. If argument fromIndex was passed let n be
          //    ToInteger(fromIndex); else let n be 0.
          var n = fromIndex | 0;

          // 6. If n >= len, return -1.
          if (n >= len) {
            return -1;
          }

          // 7. If n >= 0, then Let k be n.
          // 8. Else, n<0, Let k be len - abs(n).
          //    If k is less than 0, then let k be 0.
          k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

          // 9. Repeat, while k < len
          while (k < len) {
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of o with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of o with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in o && o[k] === searchElement) {
              return k;
            }
            k++;
          }
          return -1;
        };
      }
    }

})();
