$(function(){
	$(".search-content")
	.focus(function(){
		$(".search-result").fadeIn();
	})
	.blur(function(){
		if(!$(".search-result").is(":hover")) {
			$(".search-result").fadeOut();
		}else{
			$(this).focus();
		}
	});
});