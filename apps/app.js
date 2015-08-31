// ################################################## Helper functions ############################################

function quantityChecker(itemQuantity) { // itemQuantity is assumed to be a string
	var validFormat = itemQuantity.match(/^[0-9]+\.?0*$/) != null;
	return validFormat && itemQuantity > 0; // return true only if itemQuantity represents a positive whole number; otherwise, false is returned  
}

function costPerQuantityChecker(itemCostPerQuantity) { // itemCostPerQuantity is assumed to be a string
	var validFormat = itemCostPerQuantity.match(/^[0-9]*\.?[0-9]{0,2}0*$/) != null;
	return validFormat && (+itemCostPerQuantity > 0) // should return true only if itemCostPerQuantity represents a positive number that
														// does not feature a nonzero number beyond the hundredths place; otherwise, false is returned; 
}

function showInvalidInputMessage() {
	alert("An invalid input was detected. Please make sure the item's name, quantity, and cost per quantity meet the required conditions. " +
		"The item's name must be filled in with some value. The item's quantity must be a positive whole number that can consists " +
		"of at most one decimal point (e.g., 10.0). The item's cost per quantity must be a positive number that has no other symbols " +
		"beyond at most one decimal point and no nonzero numbers beyond the hundredths place. Do not use commas or currency symbols (e.g., $).");
}

function roundTotalCostNearestCent(totalCost) { // totalCost is assumed to be a number
	return Math.round(totalCost*100)/100;
}

function showCost(idSelectorName, num) { // finds and shows the cost of all items listed under idSelectorName id
	// assumes idSelectorName has the value "allVerifiedCosts" or "allReviewCosts" and num is a number
	
	var selector = $("#" + idSelectorName); 
	var previousVal = selector.text(); //first character in selector.text() should be "$" sign. 
	selector.html( previousVal.charAt(0) + (+previousVal.slice(1) + num) )
}

function showNumOfItems(idSelectorName, num) { // finds and shows the number of items listed under idSelectorName id
	// assumes idSelectorName has the value "numOfVerifiedItems" or "numOfReviewItems" and num is a number
	
	var selector = $("#" + idSelectorName); 
	var previousVal = selector.text(); 
	selector.html(+previousVal + num );
}

function deleteItem(inputType) { // inputType is assumed to be "this" from input[type='button'] or input[type='checkbox']
	$(inputType).parent().parent().remove();
}

function getItemTotalCostDOM(inputType) { // inputType is assumed to be "this" from input[type='button'] or input[type='checkbox']
	 return $(inputType).parent().siblings().find(".itemTotalCost") // note that this is a element from the HTML DOM (document object model)  
}

function getItemTotalCost(inputType) { // inputType is assumed to be "this" from input[type='button'] or input[type='checkbox']
	return parseFloat(getItemTotalCostDOM(inputType).html().slice(1));
}

// ############################################################## END #######################################################



$(document).ready(function() {
	var itemNum = 1;
	
	$("#reviewItems").sortable(); // allow the user to change a items' positions when reviewing the item
	$("#verifiedItems").sortable(); // allow the user to change a items' positions after verifying the item
	
	//-------------------------------- allow the user to add an item  ------------------------------------
	$('#insertInfo').submit(function(event) { // wait for the user to submit information about the item he/she wants on his/her shopping list
		event.preventDefault();
		var itemObj = { // item's information based on what the user entered before the item is reviewed by the user
			name: $(this).find("input[name='item-name']").val(),
			quantity: $(this).find("input[name='item-quantity']").val(),
			costPerQuantity: $(this).find("input[name='item-costPerQuantity']").val(),
			additionalInfo: $(this).find("textarea").val(),
			num: itemNum  // acts as an identifier for the which item this is
		};
		
		// check some user inputs
		if(quantityChecker(itemObj.quantity) && costPerQuantityChecker(itemObj.costPerQuantity)){ // valid inputs
			itemObj.totalCost = roundTotalCostNearestCent(itemObj.quantity * itemObj.costPerQuantity); // a new property the item object 
			
			showCost("allReviewCosts", itemObj.totalCost); // since the item has been added by the user, it must the item must now be reviewed by the user							
			
			showNumOfItems("numOfReviewItems", 1); // increment the number of items left to be reviewed by one
			
			var itemDiv = createDivForUserInterface(itemObj); // set divs based on what the user submitted and in a more user-friendly view
		
			$('#reviewItems').append(itemDiv);// allow the user see an interface for reviewing information about the item 			
		
			createButtonAndCheckboxEvents($('#reviewItems').find("#item-" + itemObj.num)); // allow the user to modify, delete, or verify the item 
		
			itemNum += 1; // increment before leaving the function so that the next item the user submits will have a different item number 
		}
		else {
			showInvalidInputMessage(); 
		}
		
		$(this).find("input[type='text']").val(''); // clear previous entries in the text boxes
	});
	

});



function createButtonAndCheckboxEvents(reviewItemsDiv) {
	/* 	reviewItemsDiv is a div under div.reviewItemsDiv (define in the HTML file index.html) and was created by the function 
			createDivForUserInterface, which is located in this file.
		
		Summary: 
		-  This function enables the user to modify, delete, or verify the item by enabling events from buttons and checkbox in order 
			for the user to perform certain actions based on what the user does. */
	
	var findElement = function(selector) { // used to help code maintainability
		return reviewItemsDiv.find(selector); 
	}
	
	// checkbox and buttons
	var editButton = findElement("input[name='edit']");
	var doneButton = findElement("input[name='done']"); 
	var deleteButton = findElement("input[name='delete']");
	var verifyBox = findElement("input[name='verify']");
	
	// all text inputs
	var allTextInputs = findElement("input[type='text'], textarea"); 
	
	//-------------------- allow user to edit the item's information ----------------------
	editButton.click(function(){ // user want to edit item's info
		allTextInputs.attr("disabled", false); // able to edit item's information
		
		// show the delete button, but hide the edit button
		$(this).css('display', 'none');
		$(this).siblings(doneButton).css('display', 'inline-block');
		
		// the user should not be able to delete or verify the item
		verifyBox.attr("disabled", true);
		deleteButton.attr("disabled", true);
	});
	
	
	//-------------------------- allow user to stop editing item's information -------------------------  
	doneButton.click(function() { // user finished editing item's info
		// check to see if inputs are valid
		var itemCostPerQuantity = $(this).parent().siblings().find("input[name='itemCostPerQuantity']").val(),
			itemQuantity = $(this).parent().siblings().find("input[name='itemQuantity']").val(),
			itemName = $(this).parent().siblings().find("input[name='itemName']").val(),
			itemTotalCostDOM = getItemTotalCostDOM(this),
			valueBeforeUpdate,
			valueAfterUpdate;
		
		if(quantityChecker(itemQuantity) && costPerQuantityChecker(itemCostPerQuantity) && itemName===''){ // valid inputs
			allTextInputs.attr("disabled", true); // unable to edit item's information
			
			// Show total cost of the items that need to be reviewed:
			valueBeforeUpdate = getItemTotalCost(this); // get item's previous total cost before the user made changes to the item's information
			itemTotalCostDOM.html("&#36;" + roundTotalCostNearestCent(itemQuantity * itemCostPerQuantity)); // show  and update item's total cost after user finished editing
			valueAfterUpdate = getItemTotalCost(this); // get item's current total cost after the user made changes tot the item's information
			showCost("allReviewCosts", valueAfterUpdate - valueBeforeUpdate); // show user the total cost of all item's that need to be reviewed
			
			
			// show the edit button, but hide the delete button
			$(this).css('display', 'none');
			$(this).siblings(editButton).css('display', 'inline-block');
			
			// the user should be able to delete or verify the item
			verifyBox.attr("disabled", false);
			deleteButton.attr("disabled", false);
		}
		else {
			showInvalidInputMessage();
		}
	});
	
	// ------------------------------------- allow the user to delete the item ----------------------- 
	deleteButton.click(function() { // user finished reviewing the item and want to delete the item
		showCost( "allReviewCosts", -getItemTotalCost(this)); // show that total costs of all items to be reviewed after eliminating this item's cost
		
		showNumOfItems("numOfReviewItems", -1); // decrement by one the number of items left to be reviewed
		
		/* Note that "-" sign indicates the item's cost must be eliminated (or subtracted) from the total cost of all items that must
			  be reviewed since the item has been chosen to be deleted by the user, and therefore, its cost should not longer be counted. */
			 
		deleteItem(this); 
	});
	
	// ------------------------------ allow the user to verify that the item belongs on the shopping list ----------------
	verifyBox.click(function() { // user finished reviewing the item and want to keep the item
		if(this.checked) {
			
			/* since the user has verified the item, the item's total cost should be eliminated from the total cost of all items
				under review and added to the total cost of all items that have been verified */				
			showCost("allReviewCosts", -getItemTotalCost(this)); 
			showCost("allVerifiedCosts", getItemTotalCost(this));
			
			/* now that this item's total cost has been moved from the total cost of all items under review, it is now time to move 
				the item from being under review to verified */
			var div = $(this).parent().siblings(); // this is contains all the labels and the final user inputs as well as the item's total cost
			div.css({ // styling 
				border: "2px solid green", 
				margin: "0em auto 1em auto",
				width: "13em",
				"float": "left",
				"padding-bottom": "1em"
			});
			
			$("#verifiedItems").append(div); // put item's information that the user verified into #verifiedItems id 
			showNumOfItems("numOfVerifiedItems", 1); // increment the number of items verified by one
			deleteItem(this); // get rid of everything that is remaining for this item that is under #reviewItems id
			showNumOfItems("numOfReviewItems", -1); // decrement the number of items left to be reviewed by one
			
		}
	});
}

function createDivForUserInterface(itemObj) { 
	/*
	itemObj is an object that contains the following properties:
		- name: a string that represent the name the user gave for the item submitted
		- quantity: a string that represents amount the user gave for how many to buy of the item submitted
		- costPerQuantity: a number that represents the amount (in U.S. dollars) the user gave for how much the item cost if only a quantity of one is bought
		- totalCost: a string that represent the amount (in U.S. dollars) the user will spend and is equal to costPerQuantity times quantity
		- additionalInfo: a string that represent any additional information the user wants to enter about the item
		- num: an automatically generated number that represents the ith number (where ith number means that this is the ith item submitted by the user)
	
	Summary: 
		-  This function sets up all the information about the item the user entered in order for the item to be reviewed by the user by returning a
			a styled div element that consists of two more div elements. This div element provides the user interface for the user to make decisions about 
			the item added and has an id to differentiate it from another div element for another item. 
	*/

	var div = document.createElement('div'),
		divSmallOne = createDivForLabelsAndTextInputs(itemObj),
		divSmallTwo = createDivForButtonsAndCheckbox(); 
	
	$(div).attr('id', 'item-' + itemObj.num) //give divBig an item number to differentiate it from other items the user chooses to enter.
		.css({							// styling
			border: "2px dashed green", 
			width: "17em", 
			display: "inline-block",
			"padding-bottom": "1em",
			margin: "1em auto"
		})
		.append(divSmallOne) //Attach divSmallOne and divSmallTwo to divBig
		.append(divSmallTwo);	
	
	return div; 
}

function createDivForLabelsAndTextInputs(itemObj) {
	/*
	itemObj is an object that contains the following properties:
		- name: a string that represent the name the user gave for the item submitted
		- quantity: a string that represents amount the user gave for how many to buy of the item submitted
		- costPerQuantity: a number that represents the amount (in U.S. dollars) the user gave for how much the item cost if only a quantity of one is bought
		- totalCost: a string that represents the amount (in U.S. dollars) the user will spend and is equal to costPerQuantity times quantity
		- additionalInfo: a string that represent any additional information the user wants to enter about the item
		- num: an automatically generated number that represents the ith number (where ith number means that this is the ith item submitted by the user)

	Summary:
		-	This function creates, styles, and returns a div element that has 
			-	labels (i.e., the paragraph elements of what the user is entering data for or looking at), 
			-	input text elements that will allow the user an interface for modifying previous information when reviewing the item, and
			-	a span element that has the added item's total cost 
	*/
	
	var div = document.createElement('div');
	var textarea = $("#insertInfo").find("textarea").clone(); 
	
	textarea.attr("disabled", true)
			.val(itemObj.additionalInfo);
			
	$(div).css({
			padding: "0em 2em",
			margin: "0em auto"
		})
		.append("<p>Name:</p>")
		.append("<input type='text' name='itemName' value=" + itemObj.name  + " disabled>")
		.append("<p>Quantity:</p>")
		.append("<input type='text' name='itemQuantity' value=" + itemObj.quantity  + " disabled>")
		.append("<p>Cost per Quantity:</p>")
		.append("&#36;<input type='text' name='itemCostPerQuantity' value=" + itemObj.costPerQuantity  + " disabled>")
		.append("<p>Additional Information:</p>")
		.append(textarea)
		.append("<p>Total Cost:</p>")
		.append("<span class='itemTotalCost'>" + "&#36;" + itemObj.totalCost + "</span>");
		
	
	// Note that the text inputs are disabled 
	
	// styling the p and input text elements so that p elements sit on top of the input text elements
	$(div).find("p").css("margin-bottom", "0em");
	$(div).find("input[type='text']").css("margin-top", "0em");
	
	$(div).find("input[name='itemCostPerQuantity']").css("width", "11.2em"); // used to keep dollar sign and this input text on same line
	
	return div;
}

function createDivForButtonsAndCheckbox(){
	/* Creates, styles, and return a div element that has buttons and a checkboxes to allow the user an interface to make a decision of what to 
		do with the item added */
	
	var div = document.createElement('div'); 
	
	$(div).css({
			width: "16em", 
			margin: "3em  auto 0em auto",
			"text-align": "center"
		})
		.append("<input type='button' name='edit' value='Edit'>")
		.append("<input type='button' name='done' value='Done'>")
		.append("<input type='button' name='delete' value='Delete'>")
		.append("Verify <input type='checkbox' name='verify' value='Verify'>");
		
	// adding some horizontal distance between the button inputs
	$(div).find("input[name='delete']").css("margin", "0em 1.5em"); 
	
	 // make the "done" Button disappear because the user should not be able to see it until after the edit button is clicked
	$(div).find("input[name='done']").css("display", "none");
	
	// styling the checkbox
	$(div).find("input[type='checkbox']").css({
		width: "1.2em", 
		height: "1.2em", 
		"vertical-align": "middle"
	});
	 

	 return div; 
}