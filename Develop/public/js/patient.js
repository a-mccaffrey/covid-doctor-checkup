function showMedication() {
    const medicationCheck = document.getElementById("medicationCheck")
    const medicationList = document.getElementById("medicationList")
    console.log(medicationList.style)
    
    if (medicationCheck.checked == true){
        medicationList.style.display = "block";
    } else {
        medicationList.style.display = "none";
    }
}