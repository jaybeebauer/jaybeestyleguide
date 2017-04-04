/**
 * Scripts for Assignment1b
 *
 * author: Joshua Bauer
 * email: joshybee@gmail.com
 * website: https://jaybeebauer.github.io/jaybeestyleguide
 *
 */
(function() {
    //We'll setup an object so it's easier to get and set form data and some variables
    var form = new formData();
    var isFormPage;
    var isPastData;

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
        liUrlText = document.createTextNode('Accessibility');
        liUrl.appendChild(liUrlText);
        li.appendChild(liUrl);
        ul[0].appendChild(li);

        //Lets check if this is the accessibility.html or not to see if we setup the form
        if (isFormPage) {
            //Get buttons
            var saveBtn = document.getElementById('save');
            var resetBtn = document.getElementById('resetdatabase');

            //Setup button event handlers
            saveBtn.addEventListener('click', storeFormData);
            resetBtn.addEventListener('click', resetDatabaseData);
        }
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
            alert("Please enter a name");
            return false;
        }
        if (form.uEmail == null || form.uName == "") {
            alert("Please enter an email address");
            return false;
        } else {
            if (!validEmail(form.uEmail)) {
                alert("Please enter a valid email address");
                return false;
            }
        }
        if (form.fontColour == null || form.uName == "") {
            alert("Please enter a hex font colour");
            return false;
        } else {
            if (!validHexColour(form.fontColour)) {
                alert("Please enter a valid hex colour");
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
})();
