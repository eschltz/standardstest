class HashMap {
	constructor() {
	  this._buckets = [];
	}
  
	_hash(key) {
	  let hash = 0;
	  for (let i = 0; i < key.length; i++) {
		hash = (hash + key.charCodeAt(i)) % this._buckets.length;
	  }
	  return hash;
	}
  
	set(key, value) {
	  const index = this._hash(key);
	  if (!this._buckets[index]) {
		this._buckets[index] = [];
	  }
  
	  const bucket = this._buckets[index];
	  for (let i = 0; i < bucket.length; i++) {
		if (bucket[i][0] === key) {
		  bucket[i][1] = value;
		  return;
		}
	  }
  
	  bucket.push([key, value]);
	}
  
	get(key) {
	  const index = this._hash(key);
	  const bucket = this._buckets[index];
	  if (!bucket) {
		return undefined;
	  }
  
	  for (let i = 0; i < bucket.length; i++) {
		if (bucket[i][0] === key) {
		  return bucket[i][1];
		}
	  }
  
	  return undefined;
	}
  
	remove(key) {
	  const index = this._hash(key);
	  const bucket = this._buckets[index];
	  if (!bucket) {
		return;
	  }
  
	  for (let i = 0; i < bucket.length; i++) {
		if (bucket[i][0] === key) {
		  bucket.splice(i, 1);
		  return;
		}
	  }
	}
}

const dataStructure = new HashMap();

//This function reads in the file name and passes it onto the next method
function getParameterByName(param_name, url = window.location.href){
	var params = location.search&&location.search.substr(1).replace(/\+/gi," ").split("&");
	var param_values = [];
	var i = 0;
	for (var param_index in params){
		var param = params[param_index].split("=");
		if(param[0] === param_name){
			param_values[i] = param.length > 1 ? "\"" + unescape(param[1]) + "\"" : "noval";
			i++;
		}
	}
	return param_values;
}

//Generate relative path for each standard document
function readSpecificEmpiricalStandard(standard_name){
	var mdFile = new XMLHttpRequest();
	var loc = window.location.pathname;
	var dir = loc.substring(0, loc.lastIndexOf('/'));
	var dir = dir.substring(0, dir.lastIndexOf('/'));
	var standard_file_name = standard_name.replaceAll("\"", "").replace(" ", "");
	var standard_file_path = dir + "/docs/standards/" + standard_file_name + ".md";
	var empirical_standard = "";
	mdFile.open("GET", standard_file_path, false);
	mdFile.onreadystatechange = function(){
		if (mdFile.readyState === 4){
			if (mdFile.status === 200  || mdFile.status == 0)
				empirical_standard = mdFile.responseText;
			else
				alert("Can't read " + standard_file_path);
		}
		else
			alert("Can't read " + standard_file_path);
	}
	mdFile.send(null);
	return empirical_standard;
}

// Load the table file for the customization of the checklist
function readSpecificEmpiricalStandard_table(standard_name){
	//loadConfiguration();
	var mdFile = new XMLHttpRequest();
	var loc = window.location.pathname;
	var dir = loc.substring(0, loc.lastIndexOf('/'));
	var dir = dir.substring(0, dir.lastIndexOf('/'));
	var standard_file_name = standard_name.replaceAll("\"", "").replace(" ", "");
	console.log(standard_file_name);
	var standard_file_path = dir + "/docs/attribute_customizations/" + standard_file_name + "_table.md";
	console.log(standard_file_path);
	var empirical_standard = "";
	mdFile.open("GET", standard_file_path, false);
	mdFile.onreadystatechange = function(){
		if (mdFile.readyState === 4){
			if (mdFile.status === 200  || mdFile.status == 0)
				empirical_standard = mdFile.responseText;
			else
				alert("Can't read " + standard_file_path);
		}
		else
			alert("Can't read " + standard_file_path);
	}
	mdFile.send(null);
	return empirical_standard;
}



//This function creates tooltips for text
//Anything between / and / is known as regular expressions
function createTooltip(checklistItemText, line_text, footnotes){
	footnote_sups = line_text.match(/(.*?)\{sup\}.+?\[\d+\]\(#[\w\d_]+\)\{\/sup\}(.*?)/g);
	if(footnote_sups){
		footnote_rest = line_text.match(/(?!.*\})(.*?)$/g);
		footnote_rest = footnote_rest.filter(function (el) {
			return el.trim() != "";
		});
		checklistItemText.innerHTML = checklistItemText.innerHTML.replace("<br>", "");
		var allTooltipsText = checklistItemText;
		var i = 0;
		for (let footnote_sup of footnote_sups){
			i++;
			ftnt = footnote_sup.match(/(.*?)\{sup\}(.*?)\{\/sup\}(.*?)/);
			var tooltip = document.createElement("span");
			tooltip.className = "tooltip";
			tooltip.innerHTML = ftnt[1].trim();

			var tooltipText = document.createElement("span");
			tooltipText.className = "tooltiptext";
			tooltipText.innerHTML = convert_MD_tags_to_HTML_tags(footnotes[ftnt[2]]);			
			tooltip.appendChild(tooltipText);
			allTooltipsText.appendChild(tooltip);
		}
		if(footnote_rest.length > 0){
			var tooltip = document.createElement("span");
			tooltip.innerHTML = footnote_rest[0].trim();
			allTooltipsText.appendChild(tooltip);
		}
		return allTooltipsText;
	}
	return checklistItemText;
}

//The text from the MD file is converted to HTML using this method
function convert_MD_tags_to_HTML_tags(text){
	// Bold text - Convert from MD to HTML tags
	if (text.match(/\*\*(.*?)\*\*/g) != null)
		text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

	// Italic text - Convert from MD to HTML tags
	if (text.match(/\*(.*?)\*/g) != null)
		text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");

	// Supplements/Links? - Convert from MD to HTML tags
	if (text.match(/\[([\w\s\d\.\-#\*_\/]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/g) != null)
		text = text.replace(/\[([\w\s\d\.\-#\*_\/]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/g, "<a target='_blank' href='$2'>$1</a>");

	return text;
}

//This function is primarily responsible for controlling the displaying of the deviation blocks in the checklist.
function generate_decision_message_block() {

	// Get the role (author, one-phase, two-phase)
	role = getParameterByName('role');

	// Number of yes's that are not checked
	checklist_yes_not_checked_count = $('input[class="checklistRadioYes"][type="radio"][value="yes"]').not(':checked').length;

	// First level no - Number of nos checked
	checklist_no_checked_count = $('input[class="checklistRadioNo"][type="radio"][value="no"]:checked').length;

	// Second level yes
	deviation_yes_checked_count = $('input[class="deviationRadioYes"][type="radio"][value="yes"]:checked').length;

	// Need to change to types
	// justification_yes_checked_count = $('input[class="justificationRadioYes"][type="radio"][value="yes"]:checked').length;
	// justification_no_checked_count = $('input[class="justificationRadioNo"][type="radio"][value="no"]:checked').length;

	// Count the number of types (type1, type2, type3, type4)
	justification_type1_checked_count = $('input[class="justificationRadioType"][type="radio"][value="type1"]:checked').length;
	justification_type2_checked_count = $('input[class="justificationRadioType"][type="radio"][value="type2"]:checked').length;
	justification_type3_checked_count = $('input[class="justificationRadioType"][type="radio"][value="type3"]:checked').length;
	justification_type4_checked_count = $('input[class="justificationRadioType"][type="radio"][value="type4"]:checked').length;

	var msg = "";

	// FOR SAVING THE FILE
	// Making sure every attribute has an option selected. z
	//check if the role selected is 'reviewer' (one-phase or two-phase)
	if (role == "\"one-phase-reviewer\""){

		document.getElementById("deviation_reasonable").style.display = "none";
		document.getElementById("deviation_unreasonable").style.display = "none";
		document.getElementById("Desirable").style.display = "none";
		document.getElementById("Extraordinary").style.display = "none";
		// checkboxInput.className = "checkbox_attributes";
		$('.checkbox_attributes').prop('checked', false);

		console.log("checklist_yes_not_checked_count: ", checklist_yes_not_checked_count); 
		console.log("checklist_no_checked_count: ", checklist_no_checked_count);
		console.log("deviation_yes_checked_count: ", deviation_yes_checked_count);
		if (checklist_yes_not_checked_count == checklist_no_checked_count & checklist_no_checked_count == (deviation_yes_checked_count+justification_type1_checked_count+justification_type2_checked_count+justification_type3_checked_count+justification_type4_checked_count)){

			document.getElementById("checklist_download").disabled = false;

			// if number of type 3 + type 4 is greater than 0
			if (justification_type3_checked_count + justification_type4_checked_count + justification_type2_checked_count > 0 ){
				msg = "REJECT";
				document.getElementById("deviation_unreasonable").style.display = "block";

			// The GATEKEEP is not needed for now, so type 2 is now considered as REJECT
			// if number of type 2 is greater than 0
			//} else if (justification_type2_checked_count > 0) {
			//	msg = "GATEKEEP";
			//	document.getElementById("deviation_reasonable").style.display = "block";
			//	document.getElementById("Desirable").style.display = "block";
			//	document.getElementById("Extraordinary").style.display = "block";

			// if number of type 1 is greater than 0
			} else if (justification_type1_checked_count > 0) {
				msg = "ACCEPT";
				document.getElementById("deviation_reasonable").style.display = "block";
				document.getElementById("Desirable").style.display = "block";
				document.getElementById("Extraordinary").style.display = "block";

			} else {
				msg = "ACCEPT";
				document.getElementById("Desirable").style.display = "block";
				document.getElementById("Extraordinary").style.display = "block";

			}
			
			// Showing a decision message is not needed for now
			//document.getElementById("decision_msg").innerHTML = msg;
			//document.getElementById("decision_msg").style.display = "block";
		}
			
		else{
			document.getElementById("checklist_download").disabled = true;
			document.getElementById("decision_msg").style.display = "none";
		}
	}

	else if (role == "\"two-phase-reviewer\""){
		
		document.getElementById("deviation_reasonable").style.display = "none";
		document.getElementById("deviation_unreasonable").style.display = "none";
		document.getElementById("Desirable").style.display = "none";
		document.getElementById("Extraordinary").style.display = "none";
		$('.checkbox_attributes').prop('checked', false);

		if (checklist_yes_not_checked_count == checklist_no_checked_count & checklist_no_checked_count == (deviation_yes_checked_count+justification_type1_checked_count+justification_type2_checked_count+justification_type3_checked_count+justification_type4_checked_count)){

			document.getElementById("checklist_download").disabled = false;

			// if number of type 4 is greater than 0
			if (justification_type4_checked_count > 0 ){

				msg = "REJECT";
				document.getElementById("deviation_unreasonable").style.display = "block";

			// if number of type 3 is greater than 0
			} else if (justification_type3_checked_count > 0) {
				msg = "REJECT BUT INVITE RESUBMISSION";
				document.getElementById("deviation_unreasonable").style.display = "block";

			// if number of type 2 is greater than 0
			} else if (justification_type2_checked_count > 0) {
				msg = "MAJOR REVISION";
				document.getElementById("deviation_reasonable").style.display = "block";
				document.getElementById("Desirable").style.display = "block";
				document.getElementById("Extraordinary").style.display = "block";
			}
			
			// if number of type 1 is greater than 0
			else if (justification_type1_checked_count > 0) {
				msg = "MINOR REVISION";
				document.getElementById("deviation_reasonable").style.display = "block";
				document.getElementById("Desirable").style.display = "block";
				document.getElementById("Extraordinary").style.display = "block";

			// ELSE: ACCEPT
			} else {
				msg = "ACCEPT";
				document.getElementById("Desirable").style.display = "block";
				document.getElementById("Extraordinary").style.display = "block";

			}

			document.getElementById("decision_msg").innerHTML = msg;
			document.getElementById("decision_msg").style.display = "block";
		}
			
		else{
			document.getElementById("checklist_download").disabled = true;
			document.getElementById("decision_msg").style.display = "none";
		}

	}


	// // This is what I need to fix
	// //check if all 'yes' are checked
	// if(checklist_yes_not_checked_count == checklist_no_checked_count & checklist_no_checked_count == (deviation_yes_checked_count+justification_yes_checked_count)){
	// 	document.getElementById("decision_msg").style.display = "block";
	// 	//document.getElementById("deviation_unreasonable").style.display = "block";
	// 	if (role == "\"one-phase-reviewer\""){
	// 		document.getElementById("deviation_unreasonable").style.display = "none";
	// 		if (justification_yes_checked_count > 0 & justification_no_checked_count == 0)
	// 			document.getElementById("deviation_reasonable").style.display = "block";
	// 		else
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 		document.getElementById("Desirable").style.display = "block";
	// 		document.getElementById("Extraordinary").style.display = "block";
	// 	}

	// 	else if (role == "\"two-phase-reviewer\""){
	// 		document.getElementById("deviation_unreasonable").style.display = "none";
	// 		if (justification_yes_checked_count > 0 & justification_no_checked_count == 0)
	// 			document.getElementById("deviation_reasonable").style.display = "block";
	// 		else
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 		document.getElementById("Desirable").style.display = "block";
	// 		document.getElementById("Extraordinary").style.display = "block";
	// 	}
	// }

	// // Not all "yes" are checked
	// else{
	// 	document.getElementById("decision_msg").style.display = "none";
	// 	if (role == "\"one-phase-reviewer\""){
	// 		document.getElementById("Desirable").style.display = "none";
	// 		document.getElementById("Extraordinary").style.display = "none";
	// 		if (justification_no_checked_count == 0 & justification_yes_checked_count == 0){
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 			document.getElementById("deviation_unreasonable").style.display = "none";
	// 		}
	// 		else if (justification_no_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 			document.getElementById("deviation_unreasonable").style.display = "block";
	// 		}
	// 		else if (justification_yes_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
	// 			document.getElementById("deviation_unreasonable").style.display = "none";
	// 			document.getElementById("deviation_reasonable").style.display = "block";
	// 		}
	// 	}

	// 	else if (role == "\"two-phase-reviewer\""){
	// 		document.getElementById("Desirable").style.display = "none";
	// 		document.getElementById("Extraordinary").style.display = "none";
	// 		if (justification_no_checked_count == 0 & justification_yes_checked_count == 0){
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 			document.getElementById("deviation_unreasonable").style.display = "none";
	// 		}
	// 		else if (justification_no_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
	// 			document.getElementById("deviation_reasonable").style.display = "none";
	// 			document.getElementById("deviation_unreasonable").style.display = "block";
	// 		}
	// 		else if (justification_yes_checked_count > 0 & checklist_yes_not_checked_count == checklist_no_checked_count){
	// 			document.getElementById("deviation_unreasonable").style.display = "none";
	// 			document.getElementById("deviation_reasonable").style.display = "block";
	// 		}
	// 	}
	// }
}

//this function manages the display of the deviation block, which is dependent upon user input
function show_deviation_block() {
	id = this.id.replace("checklist-radio:No:", "")
	var block = document.getElementById("deviation_block:" + id);
	block.style.display = "block";

	let deviationRadioYes = document.getElementById("deviation_block-radio:Yes:" + id);
	if(deviationRadioYes.disabled){
		let deviationRadioNo = document.getElementById("deviation_block-radio:No:" + id);
		deviationRadioNo.click();
		create_deviation_justification_block.call(deviationRadioNo);
	}
	//This function is primarily responsible for controlling the displaying of the deviation blocks in the checklist.
	generate_decision_message_block();
}

//this function manages the display of the deviation block, which is dependent upon user input
function hide_deviation_block() {

	// Replace ID from Yes to an empty string
	id = this.id.replace("checklist-radio:Yes:", "")
	hide_other_messages(id);

	// Hide all Deviation Blocks
	var block = document.getElementById("deviation_block:" + id);
	block.style.display = "none";
	var block = document.getElementById("deviation_justified:" + id);
	block.style.display = "none";
	var block = document.getElementById("deviation_not_justified:" + id);
	block.style.display = "none";
	var msg_block = document.getElementById("free_text_question:" + id);
	msg_block.style.display = "none";

	// Uncheck all deviation-block-radio
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_block-radio");
	for(let i = 0; i < document.getElementsByName(deviation_radio_name).length; i++){
		document.getElementsByName(deviation_radio_name)[i].checked = false;
	}

	// Uncheck all deviation-justified-radio
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_justified-radio");
	for(let i = 0; i < document.getElementsByName(deviation_radio_name).length; i++){
		document.getElementsByName(deviation_radio_name)[i].checked = false;
	}

	// Uncheck all deviation-not-justified-radio
	deviation_radio_name = this.name.replace("checklist-radio", "deviation_not_justified-radio");
	for(let i = 0; i < document.getElementsByName(deviation_radio_name).length; i++){
		document.getElementsByName(deviation_radio_name)[i].checked = false;
	}

	//This function is primarily responsible for controlling the displaying of the deviation blocks in the checklist.
	generate_decision_message_block();
}

//this function is responsible for hiding all messages displayed as a result of selecting 'No'
// ??????????????????????????????????????
function hide_other_messages(id) {
	try {
		document.getElementById("deviation_reasonable:" + id).style.display = "none";
		document.getElementById("deviation_unreasonable:" + id).style.display = "none";
		document.getElementById("justification_reasonable:" + id).style.display = "none";
		document.getElementById("justification_unreasonable:" + id).style.display = "none";
		document.getElementById("free_text_question:" + id).style.display = "none";
	}
	catch(err) {}
}

//this function creates a deviation block for all Essential items in the standards
function create_deviation_justification_block() {
	// (No-Yes) deviation is justified
	console.log(this);
	if(this.id.includes("deviation_block-radio:Yes:")){
		id = this.id.replace("deviation_block-radio:Yes:", "")
		hide_other_messages(id);
		var block = document.getElementById("deviation_not_justified:" + id);
		block.style.display = "none";
		var block = document.getElementById("deviation_justified:" + id);
		block.style.display = "block";
		var msg_block = document.getElementById("free_text_question:" + id);
		msg_block.style.display = "none";
		deviation_radio_name = this.name.replace("deviation_block-radio", "deviation_not_justified-radio");

		for(let i = 0; i < document.getElementsByName(deviation_radio_name).length; i++){
			document.getElementsByName(deviation_radio_name)[i].checked = false;
		}
	}
	// (No-No) deviation is unjustified
	else if(this.id.includes("deviation_block-radio:No:")){
		id = this.id.replace("deviation_block-radio:No:", "")
		hide_other_messages(id);
		var empty_message = document.getElementById("deviation_justified:" + id);
		empty_message.style.display = "none";
		var message = document.getElementById("deviation_not_justified:" + id);
		message.style.display = "block";
		var msg_block = document.getElementById("free_text_question:" + id);
		msg_block.style.display = "block";
		deviation_radio_name = this.name.replace("deviation_block-radio", "deviation_justified-radio");

		for(let i = 0; i <document.getElementsByName(deviation_radio_name).length; i++){
			document.getElementsByName(deviation_radio_name)[i].checked = false;
		}
	}
	else{
		// (No-Yes-Yes) => deviation is justified and justification is reasonable
		if(this.id.includes("deviation_justified-radio:Yes:")){
			id = this.id.replace("deviation_justified-radio:Yes:", "")
			hide_other_messages(id);
			var message = document.getElementById("justification_reasonable:" + id);
			message.style.display = "block";
		}
		// (No-Yes-No) => deviation is justified but justification is unreasonable
		else if(this.id.includes("deviation_justified-radio:No:")){
			id = this.id.replace("deviation_justified-radio:No:", "")
			hide_other_messages(id);
			var message = document.getElementById("justification_unreasonable:" + id);
			message.style.display = "block";
		}
		// (No-No-Yes) => deviation is unjustified but reasonable
		else if(this.id.includes("deviation_not_justified-radio:Yes:")){
			id = this.id.replace("deviation_not_justified-radio:Yes:", "")
			hide_other_messages(id);
			var message = document.getElementById("deviation_reasonable:" + id);
			message.style.display = "block";
		}
		// (No-No-No) => deviation is unjustified and unreasonable
		else if(this.id.includes("deviation_not_justified-radio:No:")){
			id = this.id.replace("deviation_not_justified-radio:No:", "")
			hide_other_messages(id);
			document.getElementById("deviation_unreasonable:" + id).style.display = "block";
		}
	}
	
	//This function is primarily responsible for controlling the displaying of the deviation blocks in the checklist.
	generate_decision_message_block();
}

function generate_question_block_without_yes_no_radio_answers(id, class_name, question, checklistItem_id, padding) {
	var question_block = document.createElement("div");

	// checklistItem_id = 1,2,3,4
	
	question_block.id = id + ":" + checklistItem_id;
	// className - deal with all of them
	question_block.className = "question_block";
	question_block.style = "padding-left:"+padding+"em; display:none";
	//console.log(question_block);
	return question_block;
}


function generate_question_block_with_yes_no_radio_answers(id, class_name, question, checklistItem_id, padding, display) {
	var question_block = document.createElement("div");

	// checklistItem_id = 1,2,3,4
	
	question_block.id = id + ":" + checklistItem_id;
	// className - deal with all of them
	question_block.className = "question_block";
	question_block.style = "padding-left:"+padding+"em; display:none";
	//console.log(question_block);

	// &rdsh: is for the arrows.
	// &nbsh: HTML can't do spaces. This is for spaces. 
	question_block.innerHTML = "&rdsh;&nbsp; " + question;

	var deviation_block_radios = document.createElement("div");

	// Yes and No Radio
	var deviationRadioYes = document.createElement("input");
	var deviationRadioNo = document.createElement("input");
	var deviationLabelYes = document.createElement("label");
	var deviationLabelNo = document.createElement("label");

	// Identify each radio button
	deviationRadioYes.id = id + "-radio:Yes:" + checklistItem_id;
	deviationRadioNo.id = id + "-radio:No:" + checklistItem_id;

	// className - deal with all of them
	deviationRadioYes.className = class_name + "Yes";
	deviationRadioNo.className = class_name + "No";

	// These are the radio buttons of that element regardless of Yes or No
	// For Hiding Buttons
	deviationRadioYes.name = id + "-radio:" + checklistItem_id;
	deviationRadioNo.name = id + "-radio:" + checklistItem_id;

	// deviation justification is a function
	deviationRadioYes.onclick = create_deviation_justification_block;
	deviationRadioNo.onclick = create_deviation_justification_block;

	// Set type of input to "radio"
	deviationRadioYes.type = "radio";
	deviationRadioNo.type = "radio";

	// Value for comparisons
	deviationRadioYes.value = "yes";
	deviationRadioNo.value = "no";

	// Actual Text of the Radio button
	deviation_block_radios.innerHTML = "&nbsp;&nbsp;&nbsp;";
	deviationLabelYes.innerHTML = "yes&nbsp;&nbsp;";
	deviationLabelNo.innerHTML = "no";

	// For Labels
	// Click on the label, click that radio button
	deviationLabelYes.htmlFor = deviationRadioYes.id;
	deviationLabelNo.htmlFor = deviationRadioNo.id;

	deviation_block_radios.appendChild(deviationRadioYes);
	deviation_block_radios.appendChild(deviationLabelYes);
	deviation_block_radios.appendChild(deviationRadioNo);
	deviation_block_radios.appendChild(deviationLabelNo);
	question_block.appendChild(deviation_block_radios);
	//console.log(question_block);

	// if the deviation reasonable is fixed in the table
	if(!display){
		deviationRadioYes.disabled = true; // Disable 'Yes' radio button

		// Cross out the label associated with the 'Yes' radio button
		deviationLabelYes.innerHTML = "<s>yes</s>&nbsp;&nbsp;";
	}
	
	return question_block;
}

// generate the question block with the type radio buttons (type 1, type 2, type 3, type 4)
function generate_question_block_with_type_radio_answers(id, class_name, question, checklistItem_id, padding, type) {
	var question_block = document.createElement("div");

	// checklistItem_id = 1,2,3,4

	question_block.id = id + ":" + checklistItem_id;
	// className - deal with all of them
	question_block.className = "question_block";
	question_block.style = "text-indent: -1.1em; display:none"; // Adjust indentation instead of padding

	// &rdsh: is for the arrows.
	// &nbsh: HTML can't do spaces. This is for spaces. 
	question_block.innerHTML = "&rdsh;&nbsp; " + question;

	var deviation_block_radios = document.createElement("div");

	// &nbsh: HTML can't do spaces. This is for spaces. 
	// 3 spaces
    deviation_block_radios.innerHTML = "&nbsp;&nbsp;&nbsp;";

	// ???????????????????
	{/* <span class="tooltiptext">Empirical research that investigates how an intervention, like the introduction of a method or tool, affects a real-life context</span> */}

	// dictionary of tooltips text for each type of unreasonable deviation
	var dict = {};
	// for(let i in type){
	// 	console.log(type[i]);
	// 	if(type[i]==1){
	// 		dict[i] = "can be fixed by editing text only; e.g. clarifying text, adding references, changing a diagram, describing an additional limitation, copyediting.";
	// 	}else if(type[i]==2){
	// 		dict[i] = "can be fixed by doing some new data analysis, redoing some existing data analysis, or collecting a small amount of additional data (e.g. going back to one interviewee, collecting some additional primary studies for a systematic review).";
	// 	}else if(type[i]==3){
	// 		dict[i] = "can be fixed completely redoing data analysis, OR collecting additional data (e.g. conducting new or additional experiments or case studies; several new interviews, one or more additional rounds of questionnaire data collection).";
	// 	}else if(type[i]==4){
	// 		dict[i] = "unacceptable conduct (e.g. plagiarism, p-hacking, HARKing, unethical data collection) OR problems the cannot be fixed without doing a brand new study (e.g. fundamentally invalid measures, data collection or analysis insufficient by an order of magnitude, no chain of evidence whatsoever from data to conclusions).";
	// 	}
	// }
	// type 1
	dict[1] = "can be fixed by editing text only; e.g. clarifying text, adding references, changing a diagram, describing an additional limitation, copyediting.";
	
	// type 2
	dict[2] = "can be fixed by doing some new data analysis, redoing some existing data analysis, or collecting a small amount of additional data (e.g. going back to one interviewee, collecting some additional primary studies for a systematic review).";
	
	// type 3
	dict[3] = "can be fixed completely redoing data analysis, OR collecting additional data (e.g. conducting new or additional experiments or case studies; several new interviews, one or more additional rounds of questionnaire data collection).";
	
	// type 4
	dict[4] = "unacceptable conduct (e.g. plagiarism, p-hacking, HARKing, unethical data collection) OR problems the cannot be fixed without doing a brand new study (e.g. fundamentally invalid measures, data collection or analysis insufficient by an order of magnitude, no chain of evidence whatsoever from data to conclusions).";



    for (let i in type) {
        var deviationRadioType = document.createElement("input");
        var deviationLabelType = document.createElement("label");

        // Identify each radio button
        deviationRadioType.id = id + "-radio:Type"+type[i]+":" + checklistItem_id;

        // className - deal with all of them
        deviationRadioType.className = class_name + "Type";
    
        // These are the radio buttons of that element regardless of Type1 or Type2
        // For Hiding Buttons
        deviationRadioType.name = id + "-radio:" + checklistItem_id;
    
        // deviation justification is a function
        deviationRadioType.onclick = create_deviation_justification_block;
    
        deviationRadioType.type = "radio";
    
        // Value for comparisons
        deviationRadioType.value = "type"+type[i];
    
        // Actual Text of the Radio button
		// Adding tooltip to type Radio button
        // deviationLabelType.innerHTML = "type "+i+"&nbsp;&nbsp;";
		deviationLabelType.innerHTML = "<div class=\"tooltip\">type "+type[i]+ "<span class=\"tooltiptext\"> "+dict[type[i]]+"</span></div>" + "&nbsp;&nbsp;";
    
        // For Labels
        // Click on the label, click that radio button
        deviationLabelType.htmlFor = deviationRadioType.id;
    
        deviation_block_radios.appendChild(deviationRadioType);
        deviation_block_radios.appendChild(deviationLabelType);

        
    }


    question_block.appendChild(deviation_block_radios);


	return question_block;
}

//generate a message with a specific style
function generate_message(id, color, text, padding, indent) {
	var message = document.createElement("div");
	message.id = id;
	message.className = "message";
	//message.innerHTML = text; // Showing instructions about explaining deviations is not needed for now
	message.style = "color:" + color + "; padding-left:"+padding+"em; text-indent:"+indent+"em; display:none";
	return message;
}

// generate the deviation block for Author Role
function generate_author_deviation_block(checklistItem_id) {
	var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "does the manuscript justify the deviation?", checklistItem_id, 2.4);

	// Author-specific deviation justification message
	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 0.65, -1);

	var deviation_not_justified = generate_message("deviation_not_justified:" + checklistItem_id, "red", "&rdsh;&nbsp; the manuscript should either conform to the standard or clearly explain why it deviates from the standard", 0.65, -1);

	deviation_block.appendChild(deviation_justified);
	deviation_block.appendChild(deviation_not_justified);

	return deviation_block;
}

function generate_free_text_question(id, class_name, question, checklistItem_id, padding) {
    var question_block = document.createElement("div");
    question_block.id = id + ":" + checklistItem_id;
	console.log(question_block.id);
    question_block.className = "question_block_free_Text";
    question_block.style = "padding-left:" + padding + "em; display:none";

    var questionText = document.createElement("div"); // Create a div for the question
    questionText.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&rdsh;&nbsp;  " + question;

    var answerInput = document.createElement("div"); // Create a div for the input answer
    var answerInputField = document.createElement("textarea");
    answerInputField.id = id + "-answer:" + checklistItem_id;
    answerInputField.className = class_name + "Answer";
    answerInputField.type = "text";
	answerInputField.style.width = "500px";
	answerInputField.style.height = "70px";
	answerInput.style = "padding-left:" + 2.5 + "em; overflow: auto;";

    answerInput.appendChild(answerInputField);

    question_block.appendChild(questionText);
    question_block.appendChild(answerInput);

	question_block.getAnswer = function () {
        return answerInputField.value;
    };
	
	console.log(answerInputField.value);

    return question_block;
}

// DEPRECATED: Ease-reviewer is a deprecated role
// function generate_ease_reviewer_deviation_block(checklistItem_id) {
// 	var deviation_block = generate_question_block_with_radio_answers("deviation_block", "deviationRadio", "<div class=\"tooltip\"> is the deviation reasonable?<span class=\"tooltiptext\">If the manuscript justifies the deviation, consider the justification offered.</span></div>", checklistItem_id, 2.4);

// 	// Author-specific deviation justification message
// 	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "black", "<b>OK</b>. Not grounds for rejection", 0.65, -1);

// 	var deviation_not_justified = generate_message("deviation_not_justified:" + checklistItem_id, "red", "&rdsh;&nbsp; Explain in your review why the deviation is unreasonable and suggest possible fixes. REJECT unless fixes are trivial.", 0.65, -1);

// 	deviation_block.appendChild(deviation_justified);
// 	deviation_block.appendChild(deviation_not_justified);
// 	return deviation_block;
// }

// generate the deviation block for One Phase Reviewer Role
function generate_one_phase_reviewer_deviation_block(checklistItem_id,data) {

	//console.log(checklistItem_id);
	// Create a question block with Yes-No radio answers
	// 2nd Question
	if(data!=null){
		var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "is the deviation reasonable?", checklistItem_id, 2.40, data.display1 == "True");

		
		// Reviewer-specific deviation justification block
		//var deviation_justified = generate_question_block_with_radio_answers("deviation_justified", "deviationRadio", "", checklistItem_id, 2.06);
		var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 2.80, -1.07);
	
		// Create a question block with type radio answers
		// 3rd Question
		// console.log(data.errortype);
		var numbersArray = data.errortype.split(",").map(function(item) {
			return parseInt(item, 10);
		});
		// console.log(numbersArray);

		var deviation_not_justified = generate_question_block_with_type_radio_answers("deviation_not_justified", "justificationRadio", "Please indicate the type of unreasonable deviations. (Pick the largest number that applies.)", checklistItem_id, 2.06, numbersArray);

		// (No-No-Yes)
		var deviation_reasonable = generate_message("deviation_reasonable:" + checklistItem_id, "red", "", 0, 0);
	
		// (No-No-No)
		var deviation_unreasonable = generate_message("deviation_unreasonable:" + checklistItem_id, "red", "", 0, 0);
		
	
		deviation_block.appendChild(deviation_justified);
		deviation_block.appendChild(deviation_not_justified);

		
		deviation_block.appendChild(deviation_reasonable);
		deviation_block.appendChild(deviation_unreasonable);

		if(data.displayfree == "True"){
			var freeTextQuestion = generate_free_text_question("free_text_question", "freeText", data.freelabel, checklistItem_id, 0);

			deviation_block.appendChild(freeTextQuestion);
		}
	}else{
		console.log("Data not fetched");
		var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "is the deviation reasonable?", checklistItem_id, 2.40);

		// Reviewer-specific deviation justification block
		//var deviation_justified = generate_question_block_with_radio_answers("deviation_justified", "deviationRadio", "", checklistItem_id, 2.06);
		var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 2.80, -1.07);
	
		// Create a question block with type radio answers
		// 3rd Question
		var deviation_not_justified = generate_question_block_with_type_radio_answers("deviation_not_justified", "justificationRadio", "Please indicate the type of unreasonable deviations. (Pick the largest number that applies.)", checklistItem_id, 2.06, type = [1,2,3,4]);
	
		// (No-No-Yes)
		var deviation_reasonable = generate_message("deviation_reasonable:" + checklistItem_id, "red", "", 0, 0);
	
		// (No-No-No)
		var deviation_unreasonable = generate_message("deviation_unreasonable:" + checklistItem_id, "red", "", 0, 0);
	
		deviation_block.appendChild(deviation_justified);
		deviation_block.appendChild(deviation_not_justified);
	
		deviation_block.appendChild(deviation_reasonable);
		deviation_block.appendChild(deviation_unreasonable);		
	}

	console.log(deviation_block);
	return deviation_block;
}

// generate the deviation block for Two Phase Reviewer Role
function generate_two_phase_reviewer_deviation_block(checklistItem_id) {

	// Create a question block with Yes-No radio answers
	// 2nd Question
	var deviation_block = generate_question_block_with_yes_no_radio_answers("deviation_block", "deviationRadio", "Is the deviation reasonable?", checklistItem_id, 2.40);

	// Reviewer-specific deviation justification block
	//var deviation_justified = generate_question_block_with_yes_no_radio_answers("deviation_justified", "deviationRadio", "", checklistItem_id, 2.06);
	var deviation_justified = generate_message("deviation_justified:" + checklistItem_id, "red", "", 2.80, -1.07);

	// Create a question block with type radio answers
	// 3rd Question
	var deviation_not_justified = generate_question_block_with_type_radio_answers("deviation_not_justified", "justificationRadio", "Please indicate the type of unreasonable deviations. (Pick the largest number that applies.)", checklistItem_id, 2.06, type = [1,2,3,4]);

	// (No-No-Yes)
	var deviation_reasonable = generate_message("deviation_reasonable:" + checklistItem_id, "red", "", 0, 0);

	// (No-No-No)
	var deviation_unreasonable = generate_message("deviation_unreasonable:" + checklistItem_id, "red", "", 0, 0);

	deviation_block.appendChild(deviation_justified);
	deviation_block.appendChild(deviation_not_justified);

	deviation_block.appendChild(deviation_reasonable);
	deviation_block.appendChild(deviation_unreasonable);

	return deviation_block;
}

// convert from Markdown to HTML checklists
function convert_MD_standard_checklists_to_html_standard_checklists(standardName, checklistName, checklistText, footnotes){

	// ???????
	tester = getParameterByName('y')[0] == 'noval' ? true : false;

	// Create Unordered List
	var checklists = document.createElement("UL");

	// Create a Bold Header
	var standard_H3 = document.createElement("B");
	standard_H3.style = "font-size:20px;";
	standard_H3.innerHTML = standardName + ":";

	// Positioning Essential, Desirable, Extraordinary lines on page
	// Essential needs more room for radio buttons
	if (checklistName == "Essential")
		checklists.style = "list-style-type:none; list-style-position:inside; padding-left:1.2em; text-indent:-2.4em;";
	else
		checklists.style = "list-style-type:none; list-style-position:inside; padding-left:0em; text-indent:-1.3em;";

	//checklists.appendChild(standard_H3); //no subheadings

	// splitting lines on bullet points from markdown file
	//console.log(checklistText);
	lines = checklistText.includes("- [ ]") ? checklistText.split("- [ ]") : checklistText.includes("-	") ? checklistText.split("-	") : checklistText.split("");

	var i = 0;

	// IMRaD line break flag is set to equal false
	var IMRaD_line_break = false;

	for(let line of lines){

		// removes whitespace
		// replace all line breaks (<br> </br>)
		// replace all tab character(\t)
		line_text = line.trim().replaceAll(" ", "").replaceAll("<br>", "").replaceAll("<br/>", "").replaceAll("\t", "");
		if (line_text != ""){
			i++;

			// ?????????????????????
			//console.log(line_text);
			line_text = line.trim().replace("---", "&mdash;");
			//console.log(line_text);
			// Trim and remove line breaks in markdown text
			while (line_text.match(/<br(\/)?>$/)) {
				line_text = line_text.replace(/<br(\/)?>$/, "");
				line_text = line_text.trim();
			}
			checklistItem_id = standardName + "-" + checklistName + ":" + i;
			console.log(checklistItem_id);
			var checklistItemLI = document.createElement("LI");
			var checklistItemText = document.createElement("span");
			if(IMRaD_line_break)
				checklists.appendChild(document.createElement("br"));

			// !!!!!!!!!!!!!!!! we dont need this part in the checklist
			if(line_text.includes("complies with all applicable empirical standards"))
				continue;
			
			// if line_text includes a specific regex set to true ( line break with horizontal rule)
			IMRaD_line_break = line_text.includes('<br\/>_hr_') ? true : false;

			// Replace line break and horizontal rule with empty string
			line_text = line_text.replace(/(<br\/>_hr_)+/g, '');

			// Change the text to the string held in line_text
			checklistItemLI.setAttribute("text", line_text);

			if(line_text.replaceAll("<br/><br>", "") == "")
				continue;
			if(line_text.includes("footnote"))
				checklistItemText = createTooltip(checklistItemText, line_text, footnotes);
			else
				checklistItemText.innerHTML = "&nbsp;" + line_text;
				// ???????????????????? previous line does what?

			//locate the current checklist into the table
			data = dataStructure.get(Encode_key(line_text))
	

			if (checklistName == "Essential"){
				// create Input Elements
				var checklistRadioYes = document.createElement("input");
				var checklistRadioNo = document.createElement("input");

				// Set the IDs
				checklistRadioYes.id = "checklist-radio:Yes:" + checklistItem_id;
				checklistRadioNo.id = "checklist-radio:No:" + checklistItem_id;

				// Set the names of the class
				checklistRadioYes.className = "checklistRadioYes";
				checklistRadioNo.className = "checklistRadioNo";
				checklistRadioYes.name = "checklist-radio:" + checklistItem_id;
				checklistRadioNo.name = "checklist-radio:" + checklistItem_id;

				// in the case of YES, hide the deviation block
				checklistRadioYes.onclick = hide_deviation_block;
				// in the case of NO, show the deviation block
				checklistRadioNo.onclick = show_deviation_block;

				// set the type of the input to "radio"
				checklistRadioYes.type = "radio";
				checklistRadioNo.type = "radio";

				// set the value to yes or no
				checklistRadioYes.value = "yes";
				checklistRadioNo.value = "no";
				checklistRadioYes.checked = tester;

				// Generate a deviation block
				var deviation_block;
				if(role == "\"author\"")
					deviation_block = generate_author_deviation_block(checklistItem_id);
				// else if(role == "\"ease-reviewer\"")
				// 	deviation_block = generate_ease_reviewer_deviation_block(checklistItem_id);
				else if(role == "\"one-phase-reviewer\""){
					// deviation_block = generate_reviewer_deviation_block(checklistItem_id);
					if(data){
						deviation_block = generate_one_phase_reviewer_deviation_block(checklistItem_id,data);
					}else{
						deviation_block = generate_one_phase_reviewer_deviation_block(checklistItem_id,null);
					}
				}
				else if(role == "\"two-phase-reviewer\"")
					deviation_block = generate_two_phase_reviewer_deviation_block(checklistItem_id);

				checklistItemText.appendChild(deviation_block);

				checklistItemLI.appendChild(checklistRadioYes);
				checklistItemLI.appendChild(checklistRadioNo);
				checklistItemLI.appendChild(checklistItemText);
			}
			// ?????????????????????????????
			else{
				var checkboxInput = document.createElement("input");
				checkboxInput.type = "checkbox";
				checkboxInput.id = checklistItem_id;
				checkboxInput.className = "checkbox_attributes";
				checkboxInput.name = checklistItem_id;
				checkboxInput.style = "color:#FFF";
				checkboxInput.value = line_text;
				checklistItemLI.appendChild(checkboxInput);
				checklistItemLI.appendChild(checklistItemText);
			}

			checklists.appendChild(checklistItemLI);
		}
	}
	return checklists;
}

//sorting all the standards, engineering research and mixed methods always displayed before any other standards regardless of any input
function sortStandards(keys){
	var sorted_keys = [];
	if (keys.includes("\"Engineering Research\"")){
		sorted_keys.push("\"Engineering Research\"")
		keys.splice(keys.indexOf("\"Engineering Research\""), 1);
	}
	if (keys.includes("\"Mixed Methods\"")){
		sorted_keys.push("\"Mixed Methods\"")
		keys.splice(keys.indexOf("\"Mixed Methods\""), 1);
	}
	sorted_keys = sorted_keys.concat(keys.sort());
	return sorted_keys;
}

var footnotes = {};
all_intro_items = "";
all_method_items = "";
all_results_items = "";
all_discussion_items = "";
all_other_items = "";
unrecognized_tags = "";
standards_with_no_tags = "";
standards_with_untagged_attributes = "";

function separate_essential_attributes_based_on_IMRaD_tags(standardName, checklistType, checklistHTML){
	if (checklistType == "Essential"){
		const IMRaD_tags = ["<intro>", "<method>", "<results>", "<discussion>", "<other>"]; // Known IMRaD tags

		// Attributes of each IMRaD tag
		var intro = checklistHTML.includes("<intro>") ? checklistHTML.match(/<intro>([\s\S]*?)\n\s*<\/?\w+>/i)[1] : "";
		var method = checklistHTML.includes("<method>") ? checklistHTML.match(/<method>([\s\S]*?)\n\s*<\/?\w+>/i)[1] : "";
		var results = checklistHTML.includes("<results>") ? checklistHTML.match(/<results>([\s\S]*?)\n\s*<\/?\w+>/i)[1] : "";
		var discussion = checklistHTML.includes("<discussion>") ? checklistHTML.match(/<discussion>([\s\S]*?)\n\s*<\/?\w+>/i)[1] : "";
		var other = checklistHTML.includes("<other>") ? checklistHTML.match(/<other>([\s\S]*?)\n\s*<\/?\w+>/i)[1] : "";

		tags = checklistHTML.match(/\n\s*<\w+>/g);
		// No tags at all => treat as '<other>'
		if (tags === null){
			other = checklistHTML;
			standards_with_no_tags += "[" + standardName + "]\n";
		}
		// Unrecognized tags => treat as '<other>'
		else for (const tag of tags){
			if (!IMRaD_tags.includes(tag.trim())){
				unrecognized_tags += "[" + tag.trim() + " @ " + standardName + "]\n";
				var unrecognized = checklistHTML.match(new RegExp(tag.trim()+"([\\s\\S]*?)<\\/?\\w+>", "i"))[1];
				other = unrecognized + other;
			}
		}
		// Attributes that do not belong under any tag => treat as '<other>'
		untaged = checklistHTML.match(/^[\s\r\n]+-([\s\S]*?)\n(<\w+>)/i);
		if(untaged != null){
			other = "-" + untaged[1] + other;
			standards_with_untagged_attributes += "[" + standardName + "]\n";
		}

		// Combine IMRaD tags of all standards
		all_intro_items = all_intro_items + intro;
		all_method_items = all_method_items + method;
		all_results_items = all_results_items + results;
		all_discussion_items = all_discussion_items + discussion;
		all_other_items = all_other_items + other;
	}
}

// Create Role Heading (Pre-Submission Checklist, Reviewer Checklist)
function create_role_heading(){
	var heading = document.createElement("H1");
	if(role == "\"author\"")
		heading.innerHTML = "Pre-Submission Checklist";
	else if(role == "\"one-phase-reviewer\"")
		heading.innerHTML = "Reviewer Checklist";
	else if(role == "\"two-phase-reviewer\"")
		heading.innerHTML = "Reviewer Checklist";
	// DEPRECATED
	// else if(role == "\"ease-reviewer\"") 
	// 	  heading.innerHTML = "Reviewer Checklist";

	return heading;
}	

// Create a message showing the loaded configuration
function create_load_config_msg(){
	var config = document.createElement("p");
	config.innerHTML = "Customized Configuration Loaded";
	config.style = "display:none;";
	return config;
}

// Prepare unordered lists
function preparation_to_convert_MD_to_HTML(standardTagName, checklistTagName, checklistInnerHTML, footnotes){

	// superscript tags
	checklistInnerHTML = checklistInnerHTML.replaceAll("<sup>", "{sup}").replaceAll("</sup>", "{/sup}");

    var tempDivElement = document.createElement("div");
    tempDivElement.innerHTML = checklistInnerHTML;
	checklistInnerText = tempDivElement.innerText;

	checklistText = checklistInnerText.replaceAll(">", "").replaceAll(/\n\s*\n/g, '\n').replaceAll("\n", "<br/>");

	// Transform Markdown tags to HTMLtags
	checklistText = convert_MD_tags_to_HTML_tags(checklistText);
	//console.log(checklistText);
	// Standard Files - Change from docs to link, change from .md file to nothing
	checklistText = checklistText.replaceAll('https://github.com/eschltz/standardstest/blob/main/docs/standards/', '../docs/standards?standard=').replaceAll('.md', '');

	// Supplement Files - Change from docs to link, change from .md file to nothing
	checklistText = checklistText.replaceAll('https://github.com/acmsigsoft/EmpiricalStandards/blob/master/Supplements/', '../Supplements?supplement=').replaceAll('.md', '');

	// Convert Markdown Checklists to HTML checklists
	checklists = convert_MD_standard_checklists_to_html_standard_checklists(standardTagName, checklistTagName, checklistText, footnotes)

	return checklists;
}

// Notify testers in the case of unrecognized tags, no tags at all, or untagged attributes
function notify_testers(){
	tester = getParameterByName('y')[0] == 'noval' ? true : false;
	if(tester){
		alert_msg = "";
		if(unrecognized_tags != "")
			alert_msg += "Warning — unrecognized tag(s):\n" + unrecognized_tags;
		if(standards_with_no_tags != "")
			alert_msg += "\nWarning — there are no tags at:\n" + standards_with_no_tags;
		if(standards_with_untagged_attributes != "")
			alert_msg += "\nWarning — there are untagged attributes at:\n" + standards_with_untagged_attributes;
		if(alert_msg != "")
		    alert(alert_msg);
	}
}

// Create download button to download text file
function create_download_button(){
	var download = document.createElement("button");
	download.innerHTML = "Download";
	download.id = "checklist_download";
	download.name = "checklist_download";
	download.disabled = true;
	download.onclick = saveFile;
	return download;
}


function create_download_configuration_button(){
	var download = document.createElement("button");
	download.innerHTML = "Download_Configuration";
	download.id = "checklist_download_config";
	download.name = "checklist_download_config";
	download.disabled = false;
	download.onclick = saveConfig;
	return download;
}

// create Header with Unordered List (Essential, Desirable, Extraordinary)
function create_requirements_heading_with_UL(title){
	var H3_ = document.createElement("H3");
	var UL_ = document.createElement("UL");
	H3_.style = "padding: 0px; margin: 0px; text-indent: -0.3em;";
	H3_.innerHTML = title;
	UL_.id = title;
	UL_.style = "padding: 0px;";
	UL_.appendChild(H3_);
	return UL_;
}

// collect footnotes
function collect_footnotes(dom, standardTag){
	var footnoteTags = dom.getElementsByTagName("footnote");

	for(let footnoteTag of footnoteTags){
		supTag = footnoteTag.getElementsByTagName("sup")[0];
		footnote_id = standardTag.getAttribute('name')+"--"+supTag.innerText.trim() // To make footnotes belong to their standards
		supTag.remove();
		footnotes[footnote_id] = footnoteTag.innerText.trim();
	}
}


// Function to convert Markdown tables to HTML tables
function convertMarkdownToHTML(markdown) {
    var lines = markdown.trim().split('\n');
    var resultHTML = '<div>';

    var currentType = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var isHeaderRow = i === 0;

        if (isHeaderRow) {
            var headers = line.split('|').map(function (header) {
                return header.trim();
            });

            currentType = headers[1];
            resultHTML += '<checklist name="' + currentType + '">';
        } else {
            var cells = line.split('|').map(function (cell) {
                return cell.trim();
            });

            if (currentType !== cells[1]) {
                resultHTML += '</checklist>';
                currentType = cells[1];
                resultHTML += '<checklist name="' + currentType + '">';
            }

            resultHTML += '<row>';
			resultHTML += '<type>' + cells[1] + '</type>';
            resultHTML += '<content>' + cells[2] + '</content>';
            resultHTML += '<Display1>' + cells[3] + '</Display1>';
            resultHTML += '<ErrorType>' + cells[4] + '</ErrorType>';
            resultHTML += '<DisplayFree>' + cells[5] + '</DisplayFree>';
            resultHTML += '<FreeLabel>' + cells[6] + '</FreeLabel>';
            resultHTML += '</row>';
        }
    }

    resultHTML += '</checklist></div>';
    return resultHTML;
}

// A function to process the Encoding method of the contents to create a unique key for every single checklist
function Encode_key(content){
	console.log(content);
	// process the conentes within <a> and </a>
	content = content.replace(/<a[^>]*>|<\/a>/g, '');
	// process the footnote issue
	content = content.replace(/\{sup\}.*?\{\/sup\}/g, '');
	// now remove all the non-alphabetic and non-numeric characters
	content = content.replace(/[^a-zA-Z0-9]/g, '');
	return content;
}

function create_requirements_checklist_table(file){
	// Create Element "FORM"
	var form = document.createElement("FORM");
	form.id = "checklists";
	form.name = "checklists";


	// unshift() method adds new items to the beginning of an array, and returns the new length
	if (!standard_keys.includes("\"General Standard\""))
		standard_keys.unshift("\"General Standard\"");
	
	if(file == null){
		var i = 0;
		const Essentail_dataStructure = new HashMap();
		const Desirable_dataStructure = new HashMap();
		const Extraordinary_dataStructure = new HashMap();
		for (let key of standard_keys){
			i++;
			// Obtain all the information for a Standard
			empirical_standard1 = readSpecificEmpiricalStandard_table(key);
			// Convert Markdown to HTML
			var htmlTable = convertMarkdownToHTML(empirical_standard1);
	
			// Get a reference to the container element where you want to display the table
			var dom1 = document.createElement("div");
			// Append the HTML table to the container
			dom1.innerHTML = htmlTable;
	
			var checklists1 = dom1.getElementsByTagName('checklist')[2];
			for(let checks of checklists1.getElementsByTagName('row')){
				var content0 = checks.getElementsByTagName('Type')[0].innerHTML;
				var content1 = checks.getElementsByTagName('content')[0].innerHTML;
				var content2 = checks.getElementsByTagName('display1')[0].innerHTML;
				var content3 = checks.getElementsByTagName('errortype')[0].innerHTML;
				var content4 = checks.getElementsByTagName('displayfree')[0].innerHTML;
				var content5 = checks.getElementsByTagName('freelabel')[0].innerHTML;
				var rowData = {
					type: content0,
					content: content1,
					display1: content2,
					errortype: content3,
					displayfree: content4,
					freelabel: content5
				};
	
				// update the encoding method to get the key for the contents
				const key = Encode_key(content1);
				dataStructure.set(key,rowData)
				//map.set(key, rowData);
				//map.set(content1.replace(/['"<>\#\[\]{}\/\s-]/g,''), rowData);
			}
			//console.log(dataStructure);
		}
	}else{
		console.log(file);

		// Parse the JSON string to an object
		const jsonObject = JSON.parse(file);

		// Loop through the keys in the parsed JSON object
		Object.keys(jsonObject).forEach(key => {
			dataStructure.set(jsonObject[key][0], jsonObject[key][1]);
		});

		console.log(dataStructure);
	}
	console.log(dataStructure);
	return;
}
  

function create_requirements_checklist(file){

	// Create Element "FORM"
	var form = document.createElement("FORM");
	form.id = "checklists";
	form.name = "checklists";

	// create Header for Essential Requirements with an unordered list
	var EssentialUL = create_requirements_heading_with_UL("Essential");

	// create Header for Desirable Requirements with an unordered list
	var DesirableUL = create_requirements_heading_with_UL("Desirable");

	// create Header for Extraordinary Requirements with an unordered list
	var ExtraordinaryUL = create_requirements_heading_with_UL("Extraordinary");

	// hide desirable and extraordinary list of requirements for One Phase Reviewer
	if(role == "\"one-phase-reviewer\""){
		DesirableUL.style = "padding: 0px; display:none;";
		ExtraordinaryUL.style = "padding: 0px; display:none;";
	}
	// hide desirable and extraordinary list of requirements for Two Phase Reviewer
	else if(role == "\"two-phase-reviewer\""){
		DesirableUL.style = "padding: 0px; display:none;";
		ExtraordinaryUL.style = "padding: 0px; display:none;";		
	}

	// unshift() method adds new items to the beginning of an array, and returns the new length
	if (!standard_keys.includes("\"General Standard\""))
		standard_keys.unshift("\"General Standard\"");
	
	create_requirements_checklist_table(file);
	//console.log(dataStructure);
	var i = 0;
	for (let key of standard_keys){
		i++;

		// Obtain all the information for a Standard
		empirical_standard = readSpecificEmpiricalStandard(key);
		//console.log(empirical_standard);

		
		var dom = document.createElement("div");
		dom.innerHTML = empirical_standard;
		var standardTag = dom.getElementsByTagName("standard")[0];
		//console.log(dom);
		//console.log(standardTag);


		// collect all the footnotes
		collect_footnotes(dom, standardTag);
		
		let standardName = "\"" + standardTag.getAttribute('name') + "\"";
		standardName = standardName.replaceAll("\"", "");
		console.log(standardName);
		// DEPRECATED
		//var standardTitle = document.createElement("H2");
		//standardTitle.innerHTML = standardName;
		//form.appendChild(standardTitle);
		
		var checklistTags = standardTag.getElementsByTagName("checklist");
		for (let checklistTag of checklistTags){

			// dealing with footnotes
			checklistHTML = checklistTag.innerHTML.replaceAll("<sup>", "<sup>"+standardName+"--") // To make footnotes belong to their standards 
			//console.log(checklistHTML)
			// Add all information for "all_intro_items", etc.
			separate_essential_attributes_based_on_IMRaD_tags(standardTag.getAttribute('name'), checklistTag.getAttribute('name'), checklistHTML)

			// Reformat the checklists from MD to HTML
			var Yes_No = document.createElement("div");
			Yes_No.style = "align:center; font-size: 80%; font-weight: bold;";
			Yes_No.innerHTML = "&nbsp;yes no";

			// DEPRECATED
			//var standard_header_rule = document.createElement("div");
			//var standard_header_text = document.createElement("span");
			//standard_header_rule.className = "standardHeaderRule";
			//standard_header_text.className = "standardHeaderText";
			//standard_header_text.innerText = standardName;
			//standard_header_rule.appendChild(standard_header_text);

			if (checklistTag.getAttribute('name') == "Essential") {
				//EssentialUL.appendChild(standard_header_rule);

				if (i == 1)
					EssentialUL.appendChild(Yes_No);
				//EssentialUL.appendChild(checklists);
			}
			else if (checklistTag.getAttribute('name') == "Desirable") {
				//DesirableUL.appendChild(standard_header_rule);

				// Change from Markdown to HTML elements
				checklists = preparation_to_convert_MD_to_HTML(standardTag.getAttribute('name'), checklistTag.getAttribute('name'), checklistHTML, footnotes);
				DesirableUL.appendChild(checklists);
			}
			else if (checklistTag.getAttribute('name') == "Extraordinary") {
				//ExtraordinaryUL.appendChild(standard_header_rule);

				// Change from Markdown to HTML elements
				checklists = preparation_to_convert_MD_to_HTML(standardTag.getAttribute('name'), checklistTag.getAttribute('name'), checklistHTML, footnotes);
				ExtraordinaryUL.appendChild(checklists);
			}
		}
	}
	all_essential_IMRaD_items_innerHTML = "" + all_intro_items + "\n_hr_" + all_method_items + "\n_hr_" + all_results_items + "\n_hr_" + all_discussion_items + "\n_hr_" + all_other_items
	all_essential_IMRaD_items_innerHTML = all_essential_IMRaD_items_innerHTML.replaceAll("\n_hr_", "").length > 0 ? all_essential_IMRaD_items_innerHTML : "";
	
	
	// Notify testers in the case of unrecognized tags, no tags at all, or untagged attributes
	notify_testers();
	
	// Change from Markdown to HTML elements
	checklists = preparation_to_convert_MD_to_HTML("", 'Essential', all_essential_IMRaD_items_innerHTML, footnotes);
	EssentialUL.appendChild(checklists);
	
	// Add Essential Attributes to the form
	form.appendChild(EssentialUL);

	// Create download button
	var download = create_download_button();

	var download_test = create_download_configuration_button();

	// (All 'Yes' -> accept manuscript)
	var decision_msg = generate_message("decision_msg", "red", (role != "\"author\"" ? "The manuscript meets all essential criteria: ACCEPT." : ""), 2, 0);
	form.appendChild(decision_msg);


	/// ???????????????????????????????????
	if(role == "\"one-phase-reviewer\""){
		// (At least one 'No-No-No' -> reject manuscript)
		var deviation_unreasonable = generate_message("deviation_unreasonable", "red", "In the free-text part of your review, please explain the deviation(s) and why they are not reasonable.", 2, 0);
		form.appendChild(deviation_unreasonable);
		// (At least one 'No-No-Yes' -> explain fix)
		var deviation_reasonable = generate_message("deviation_reasonable", "red", "In the free-text part of your review, please explain the deviation(s) and why they are not reasonable. Please give specific suggestions for how each deviation can be addressed.", 2, 0);
		form.appendChild(deviation_reasonable);

		if(deviation_unreasonable.style.display == "block"){
			download.disabled = false;
		}
	}
	else if(role == "\"two-phase-reviewer\""){
		// (At least one 'No-No-No' -> reject manuscript)
		var deviation_unreasonable = generate_message("deviation_unreasonable", "red", "In the free-text part of your review, please explain the deviation(s) and why they are not reasonable.", 2, 0);
		form.appendChild(deviation_unreasonable);

		// (At least one 'No-No-Yes' -> explain fix)
		var deviation_reasonable = generate_message("deviation_reasonable", "red", "In the free-text part of your review, please explain the deviation(s) and why they are not reasonable. Please give specific suggestions for how each deviation can be addressed.", 2, 0);
		form.appendChild(deviation_reasonable);

		if(deviation_unreasonable.style.display == "block"){
			download.disabled = false;
		}
	}

	// Add Desirable and Extraordinary Unordered List to Form
	form.appendChild(DesirableUL);
	form.appendChild(ExtraordinaryUL);

	// Add Download Button for One Phase Reviewer and Two Phase Reviewer
	if(role == "\"one-phase-reviewer\"") {
		form.appendChild(download);
		// Delete the download_Configuration button for phase 1
		// form.appendChild(download_test);
	}
	if(role == "\"two-phase-reviewer\"") {
		form.appendChild(download);
	}
	
	return form;
}

// Add the bottom of checklist "For more information, see: "
function create_for_more_info_part(standard_keys){
	var more_info_DIV = document.createElement("DIV");
	var more_info_H2 = document.createElement("H2");
	more_info_H2.innerHTML = "For more information, see:";
	
	var standards_path = "../docs/standards?standard="
	var more_info_UL = document.createElement("UL");

	// Adding Standards as a list with a link to the correct page
	for (let key of standard_keys){
		key = key.replaceAll("\"", "");
		var LI = document.createElement("LI");
		var LINK = document.createElement("A");
		LINK.innerHTML = key;
		LINK.href = standards_path + key.replaceAll(" ", "");
		LINK.target = "_blank";
		LINK.style = "font-size:23px;";
		LINK.id = "standardNames";
		LI.appendChild(LINK);
		more_info_UL.appendChild(LI);
	}
	more_info_DIV.appendChild(more_info_H2);
	more_info_DIV.appendChild(more_info_UL);
	return more_info_DIV;
}

function generateStandardChecklist(file){
	console.log(file);
	// list of Standards
	standard_keys = getParameterByName('standard');

	// return sorted list of Standards
	standard_keys = sortStandards(standard_keys);

	// return the role (author, one-phase, two-phase)
	role = getParameterByName('role');
	
	var wrappers = document.getElementsByClassName('wrapper');
	var wrapper = null;
	if (wrappers.length > 0)
		wrapper = wrappers[1];

	// Create container that holds header, checklist, etc.
	var container = document.createElement("DIV");
	container.id = "container";

	// Create header (Pre-submission Checklist, Reviewer Checklist)
	var heading = create_role_heading();

	// Create a message showing the loaded configuration
	var config = create_load_config_msg();

	// Create Checklist
	var form = create_requirements_checklist(file);

	// Append header and form to container
	container.appendChild(heading);
	container.appendChild(config);
	container.appendChild(form);

	// Creates line separating from checklist and "for more information, see:"
	HR = document.createElement("HR");
	container.appendChild(HR);

	// Create "For more information, see:"
	var more_info_DIV = create_for_more_info_part(standard_keys);
	container.appendChild(more_info_DIV);

	if (wrapper == null)
		document.body.appendChild(container);
	else
		wrapper.appendChild(container);
	
	//This function is primarily responsible for controlling the displaying of the deviation blocks in the checklist.
	generate_decision_message_block();
}


//Download the checklist with a specific format
function saveFile(){
	var checklists = document.getElementById('checklists');
	var generated_text = '=================\n' +
		'Review Checklist\n' +
		'=================\n';
	
	let date_generated = new Date();
	generated_text += '\nGenerated at: ' + date_generated.toDateString() + ', ' + date_generated.toLocaleTimeString() + '\n';
		
	var decision = document.getElementById("decision_msg");
	var unreasonable = document.getElementById("deviation_unreasonable");
	var reasonable = document.getElementById("deviation_reasonable");

	if(decision.style.display == "block") {
		generated_text += "\nRecommended Decision: " + decision.innerText + "\n";
	}
	
	if(unreasonable.style.display == "block") {
		generated_text += "\nUnreasonable Deviations\n";
	}

	if(reasonable.style.display == "block") {
		generated_text += "\nUnreasonable Deviations Requiring Revision\n";
	} else {
		generated_text += "";
	}
	
	var essential_list = "\nEssential\r\n";
	var desirable_list = "\nDesirable\r\n";
	var extraordinary_list = "\nExtraordinary\r\n";
	var free_text_list = "\nFree Text Questions\r\n"
	
	var include_desirable = false;
	var include_extraordinary = false;
	
	var type1_list = "";
	var type2_list = "";
	var type3_list = "";
	var type4_list = "";
	
	for (let list of checklists.children) {
		if(list.tagName.toLowerCase() == 'ul' & list.style.display != 'none'){
			for (let ul of list.children) {
				if(ul.tagName.toLowerCase() == 'ul'){
					var i = 0;
					for (let li of ul.children) {
						if (li.tagName.toLowerCase() != 'li')
						   continue;
						i++;
						var li_text = li.getAttribute("text");
						var regex = /<a+\n*.+<\/a>/g;
						if (li_text.match(regex) != null)
							li_text = li_text.replace(regex, "");

						var regex2 = /\{sup\}.+\{\/sup\}/g;
						var regex3 = /<br\/>/g;
						var regex4 = /<\/b>/g;
						var regex5 = /<b>/g;
						var regex6 = /[\r\n]+/g;
						var regex7 =/ \(.+?\)/g;
						var regex8 = /<i>/g;
						var regex9 = /<\/i>/g;

						if (li_text.match(regex2) != null)
							li_text = li_text.replace(regex2, "");
						if (li_text.match(regex3) != null)
							li_text = li_text.replace(regex3,"\n");
						if (li_text.match(regex4) != null)
							li_text = li_text.replace(regex4,"");
						if (li_text.match(regex5) != null)
							li_text = li_text.replace(regex5,"");
						if (li_text.match(regex6) != null)
							li_text = li_text.replace(regex6,"");
						if (li_text.match(regex7) != null)
							li_text = li_text.replace(regex7,"");
						if (li_text.match(regex8) != null)
							li_text = li_text.replace(regex8,"");
						if (li_text.match(regex9) != null)
							li_text = li_text.replace(regex9,"");

						if (list.id == 'Essential'){
							if (li.children[0].checked)
								essential_list +=  'Y' + '\t   ' + li_text + '\r\n';
							else{
								var reasonable_deviation = li.getElementsByClassName('deviationRadioYes')[0];

								// store for the free_text_question
								var questionDiv  = li.getElementsByClassName("question_block_free_Text");
								if(questionDiv[0]){
									var question_text = questionDiv[0].querySelector('div:first-child').textContent.trim().replace(/^\W+/g, '');
									console.log(question_text)
									var inputCollection  = li.getElementsByClassName('freeTextAnswer');
									console.log(inputCollection);
									if(inputCollection[0]){
										var input_text = inputCollection[0].value;
									}
									
									// free_text_list += li_text + '\r\n'
									// free_text_list += '    ' + question_text + ': ' + input_text + '\r\n';
								}
								if (reasonable_deviation.checked)
									essential_list += 'R' + '\t   ' + li_text + '\r\n';
								else{
									var fixable_deviation = li.getElementsByClassName('justificationRadioType');
									if (fixable_deviation[0].checked) {
										type1_list += '1\t   ' + li_text + '\r\n';
										if(input_text !== ""){
											type1_list += ' \t   ' + question_text + '\r\n';
											type1_list += ' \t    \t   ' + input_text + '\r\n';
										}
									} else if (fixable_deviation[1].checked) {
										type2_list += '2\t   ' + li_text + '\r\n';
										if(input_text !== ""){
											type2_list += ' \t   ' + question_text + '\r\n';
											type2_list += ' \t    \t   ' + input_text + '\r\n';
										}
									}  else if (fixable_deviation[2].checked) {
										type3_list += '3\t   ' + li_text + '\r\n';
										if(input_text !== ""){
											type3_list += ' \t   ' + question_text + '\r\n';
											type3_list += ' \t    \t   ' + input_text + '\r\n';
										}
									}  else if (fixable_deviation[3].checked) {
										type4_list += '4\t   ' + li_text + '\r\n';
										if(input_text !== ""){
											type4_list += ' \t   ' + question_text + '\r\n';
											type4_list += ' \t    \t   ' + input_text + '\r\n';
										}
									}
								}

								// store for the free_text_question
								// var questionDiv  = li.getElementsByClassName("question_block_free_Text");
								// if(questionDiv[0]){
								// 	var question_text = questionDiv[0].querySelector('div:first-child').textContent.trim().replace(/^\W+/g, '');
								// 	console.log(question_text)
								// 	var inputCollection  = li.getElementsByClassName('freeTextAnswer');
								// 	if(inputCollection[0]){
								// 		var input_text = inputCollection[0].value;
								// 		console.log(input_text)
								// 	}
									
								// 	free_text_list += li_text + '\r\n'
								// 	free_text_list += '    ' + question_text + ': ' + input_text + '\r\n';
								// }

							}
						}
						else if (list.id == 'Desirable') {
							if (li.children[0].checked) {
								include_desirable = true;
								desirable_list += 'Y' + '\t   ' + li_text + '\r\n';
							}
						} else if (li.children[0].checked) {
							include_extraordinary = true;
							extraordinary_list += 'Y' + '\t   ' + li_text + '\r\n';
						}

					}

				}
			}
		}
	}
	
	generated_text += type4_list + type3_list + type2_list + type1_list;
	// generated_text += free_text_list;
	
	generated_text += essential_list;
	
	if (include_desirable) {
		generated_text += desirable_list;
	}
	if (include_extraordinary) {
		generated_text += extraordinary_list;
	}

	generated_text += "\n" +
		"=======\n" +
		"Legend\n" +
		"=======\n" +
		"Y = yes, the paper has this attribute\n" +
		"R = a reasonable, acceptable deviation from the standards\n" +
		"1 = a deviation that can be fixed by editing text only\n" +
		"2 = a deviation that can be fixed by doing some new data analysis, redoing some existing data analysis, or collecting a small amount of additional data\n" +
		"3 = a deviation that can be fixed by completely redoing data analysis, or collecting additional data\n" +
		"4 = a deviation that cannot be fixed, or at least not without doing a brand new study\n\n\n";

	generated_text+= "=================\n" +
		"Standards Used\n" +
		"=================\n";

	var elms = document.querySelectorAll("[id='standardNames']");
	for(var i = 0; i < elms.length; i++)
		generated_text += elms[i].innerHTML + '\n';

	pageURL = window.location.href;	
	generated_text += "\nURL: " + pageURL;

	var newLink = document.createElement('a');
	newLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generated_text);
	newLink.download = 'reviewChecklist.txt';

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        newLink.dispatchEvent(event);
    }
    else
        newLink.click();
	return false;
}


function saveConfig(){
	// Convert HashMap to JSON string
	console.log(dataStructure._buckets)
	// Loop through the _buckets array in yourHashMap
	const extractedData = {};

	// Loop through the _buckets array in dataStructure
	dataStructure._buckets.NaN.forEach((value, index) => {
		console.log(value);
		console.log(index);
		extractedData[index] = value;
	});
	console.log(extractedData)
	const jsonContent = JSON.stringify(extractedData);

	// Parse the JSON string to an object
	const jsonObject = JSON.parse(jsonContent);

	// Convert the object back to a formatted JSON string with indentation
	const formattedJsonContent = JSON.stringify(jsonObject, null, 2);

	// Create a Blob from the formatted JSON content
	const blob = new Blob([formattedJsonContent], { type: 'application/json' });

	// Create a temporary URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create a download link
	const downloadLink = document.createElement('a');
	downloadLink.href = url;
	downloadLink.download = 'reviewConfig.json'; // Set the file name here

	// Append the download link to the body (or any other part of the DOM)
	document.body.appendChild(downloadLink);

	// Programmatically trigger the click event on the download link
	downloadLink.click();

	// Clean up by revoking the Blob URL
	URL.revokeObjectURL(url);
	return false;
}

function viewStandardDescription(standard_name){
	// Obtain all the information for a Standard
	empirical_standard = readSpecificEmpiricalStandard(standard_name);
	var dom = document.createElement("div");
	dom.innerHTML = empirical_standard;
	var standardTag = dom.getElementsByTagName("standard")[0];
	var descTags = standardTag.getElementsByTagName("desc");
	for (let descTag of descTags) {
		descHTML = descTag.innerHTML.replaceAll(">", "").replaceAll(/\n\s*\n/g, '\n').replaceAll("\n", " ").replaceAll("*", "");
	}
	return descHTML;
}