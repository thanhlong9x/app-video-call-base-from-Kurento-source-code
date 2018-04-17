
	function Mute(){
      console.log("Mute");
    }

	function Out(){
      console.log("Out Room");
    }

	function Accept(){
      console.log("Accept");
    }        

	function Ignore(){
      console.log("Ignore");
    }    

  function Logout(){
    console.log("Logout");
  }

  $('.video').click(function () {
    //var video = $(".video").get(0);
    
    if ( video.paused ) {
        $(".video").get(0).play();
        $(".volume").fadeOut();
    } else {
        $(".video").get(0).pause();
        $(".volume").fadeIn();
    }
  });


