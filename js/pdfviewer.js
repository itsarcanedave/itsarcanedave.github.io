function generateUrl(url){
    let file = url;
    let closeUrl= "&embedded=true";
    let domain = "https://docs.google.com/viewer?url=";
    let main = domain + file +  closeUrl ;
    document.getElementById("demo").src= main ;
    document.getElementById("Overlay").style.display= "inline-block";
}
$("#Overlay").click(function(){
    $("#demo").show();
});

$("#close").click(function(){
    $("#Overlay").hide();
});