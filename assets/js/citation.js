let cite_button = document.getElementById("cite-button");
let citation_modal = document.getElementById("citation-modal");
let close_modal = document.getElementById("close-modal");
let copy_button = document.getElementById("copy-citation");
		
cite_button.addEventListener("click", () => {
	citation_modal.showModal();
});
		
close_modal.addEventListener("click", () => {
	citation_modal.close();
});
		
citation_formats = document.getElementById("citation-formats");

const acm = "Paul Ralph et al. 2021. Empirical Standards for Software Engineering Research. arXiv:2010.03525. Retrieved from https://arxiv.org/abs/2010.03525";
const apa = "Ralph, P., Ali, N. B., Baltes, S., Bianculli, D., Diaz, J., Dittrich, Y., ... & Vegas, S. (2021). Empirical Standards for Software Engineering Research. arXiv preprint arXiv:2010.03525 [cs.SE]";
const bibtex = "@misc{ralph2021empiricalstandardssoftwareengineering,\n      title={Empirical Standards for Software Engineering Research}, \n      author={Paul Ralph and Nauman bin Ali and Sebastian Baltes and Domenico Bianculli and Jessica Diaz and Yvonne Dittrich and Neil Ernst and Michael Felderer and Robert Feldt and Antonio Filieri and Breno Bernard Nicolau de França and Carlo Alberto Furia and Greg Gay and Nicolas Gold and Daniel Graziotin and Pinjia He and Rashina Hoda and Natalia Juristo and Barbara Kitchenham and Valentina Lenarduzzi and Jorge Martínez and Jorge Melegati and Daniel Mendez and Tim Menzies and Jefferson Molleri and Dietmar Pfahl and Romain Robbes and Daniel Russo and Nyyti Saarimäki and Federica Sarro and Davide Taibi and Janet Siegmund and Diomidis Spinellis and Miroslaw Staron and Klaas Stol and Margaret-Anne Storey and Davide Taibi and Damian Tamburri and Marco Torchiano and Christoph Treude and Burak Turhan and Xiaofeng Wang and Sira Vegas}, \n      year={2021}, \n      eprint={2010.03525}, \n      archivePrefix={arXiv}, \n      primaryClass={cs.SE}, \n      url={https://arxiv.org/abs/2010.03525}, }";
const ieee = "P. Ralph et al., \"Empirical Standards for Software Engineering Research,\" 2021, arXiv:2010.03525";
const ris = "TY  - ELEC\nAU  - P. Ralph et al.\nPY  - 2021\nTI  - Empirical Standards for Software Engineering Research\nID  - arXiv:2010.03525 [cs.SE]\nDO  - 10.48550/arXiv.2010.03525\nER  -";
		
// Update citation text according to selected format
citation_formats.addEventListener("change", () => {
	let option =  citation_formats.value;
	if (option == "acm") {
		document.getElementById("citation-text").value = acm;
	} else if (option == "apa") {
		document.getElementById("citation-text").value = apa;
	} else if (option == "bibtex") {
		document.getElementById("citation-text").value = bibtex;
	} else if (option == "ieee") {
		document.getElementById("citation-text").value = ieee;
	} else if (option == "ris") {
		document.getElementById("citation-text").value = ris;
	}
});
		
// Copy citation text according to clipboard
copy_button.addEventListener("click", () => {
	let copy = document.getElementById("citation-text").value;

	navigator.clipboard.writeText(copy).then(function() {
		console.log('Citation copied to clipboard.');
	}, function(err) {
		console.error('Could not copy citation to cliboard: ', err);
	});
});