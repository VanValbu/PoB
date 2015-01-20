(function ($){
var mapSVG;
var hexMap;

var loadMap=function(){
            var loadDeffered=$.Deferred();// make jQuery.Deferred to load SVG prioe to anything else being executed.
    
        Snap.load("http://localhost/Point_of_Battle/PoB_Map_single.svg", function(f){
            mapSVG=f;
            hexMap=mapSVG.select('#HexMap');
            
            loadDeffered.resolve('mapSVG was loaded');
        });
       return loadDeffered.promise(); 
};
    
$.when(loadMap()).then(function(){
   
    /* CLASS Batlemap
    * uses pre loaded SVG as source for rendering the map
    *
    */
    function BattleMap(mapSelector, sourceSVGMap){
        
        var currentMapHeight=0;
        var currentMapWidth=0;
        var mapSelector=mapSelector;
        this.origMapWidth=2077;
        this.origMapHeight=1885;
        this.currentScale;
        this.strokeWidth=1; 
        this.paper;
        this.m= new Snap.matrix();
        this.hexmap=0;
        this.secondMap=0;
        var rescaleModes=['fit','large'];
        this.rescaleMode=rescaleModes[0];
        
        var $this=this;//bind this to instance of BattleMap
        
        
        //constructor
        var __construct=function(){ 
                $this.paper = new Snap(mapSelector);
                $this.calcScaleForViewport(); // calculate Scale for current veiwport size
                $this.calcPaperToViewport($this.currentScale);//size SVG to fit the screen
                $this.hexmap = hexMap.clone();
                $this.paper.append($this.hexmap);
                $this.m.scale($this.currentScale);
                $this.hexmap.transform($this.m);
                $this.hexmap.selectAll('polygon').attr({'strokeWidth':$this.strokeWidth/$this.currentScale});
                $this.hexClickable();
        };
        
        this.calcScaleForViewport=function (){
            //TODO checkout magic padding of 50px?
            var scale=1;   
            var currentClientHeight=document.documentElement.clientHeight;
            var currentClientWidth=document.documentElement.clientWidth;

            switch ($this.rescaleMode){ 
                    case 'fit':
                        if(currentClientHeight<currentClientWidth){
                            scale=(currentClientHeight-50)/this.origMapHeight;
                        }else{
                            scale=(currentClientWidth-50)/this.origMapWidth;
                        }
                        break;
                    case 'large':
                        if(currentClientHeight<currentClientWidth){
                            scale=(currentClientHeight-50)*3/this.origMapHeight;
                        }else{
                            scale=(currentClientWidth-50)*3/this.origMapWidth;
                        }
                        break;
                    default:
                        break;

            }
            scale=Math.round(scale*100)/100;
            $this.currentScale=scale;
            return scale;   
        };
        this.calcPaperToViewport =function(){
            currentMapHeight= this.origMapHeight*$this.currentScale;
            currentMapWidth=this.origMapWidth*$this.currentScale;
             //TODO check how to fix magic padding in svg root element
            this.paper.attr({
                 'height':currentMapHeight+100*$this.currentScale,
                 'width':currentMapWidth+100*$this.currentScale        
                        });
        }
        
        this.rescaleMap=function(){
            
            $this.calcScaleForViewport();
            
            $this.m= $this.hexmap.transform().localMatrix;
            $this.m.a=$this.currentScale;
            $this.m.d=$this.currentScale;

            $this.calcPaperToViewport();

            $this.hexmap.transform($this.m);
            $this.hexmap.selectAll('polygon').attr({'strokeWidth':$this.strokeWidth/$this.currentScale});
            
            
           
        };
        this.centerMap=function(){
            //window.scroll(horizontalOffset, verticalOffset)
        };
        
        window.onresize= function(){
            $this.rescaleMap(); 
        };

        $this.getHexMap= function(){
                return $this.hexmap;
        };
        $this.viewMode=function(mode){
            switch(mode){
                    case 'fit':
                        $this.rescaleMode=rescaleModes[0];
                        $this.rescaleMap();
                        return 'fit';
                        break;
                    case 'large':
                        $this.rescaleMode=rescaleModes[1];
                        $this.rescaleMap();
                        return 'large';
                        break;
                    default:
                        return 'mode input not accepted';
                        break;
                        
            }
        }
        $this.hexClickable=function(){
           var hexes=$this.hexmap.selectAll('polygon');
           jQuery.each(hexes,function(index,hex){
               // console.log(this.node);
             
               hex.node.click=function(){//TODO bind eventhandler to ech hex-field
               // console.log(this);
               };
           }); 
    
            
        }
        __construct(); //init object
    };
    function MiniMap(htmlSelector, containerSelector,BattleMap){
        $this=this;
        $this.htmlSelector=htmlSelector;
        $this.containerSelector=containerSelector;
        var width=220;
        var height=202;
        $this.strokeWidth=1; 
        $this.paper;
        $this.hexmap;
        var battleMap=BattleMap;
        var m=Snap.matrix();
        
        var __construct=function(){
            
            $this.paper=new Snap($this.htmlSelector);
            $this.paper.attr({'height':height,'width':width});
            //$this.hexmap =battleMap.getHexMap().clone();
            $this.hexmap=hexMap.clone();
            $(containerSelector).css({'width':width,'height':height});
            $this.scaleMap();
            $this.paper.append($this.hexmap);
           //$($this.htmlSelector).css('visibility','visible');
        };
        $this.scaleMap=function(){
            var scale=0.1;
                m.scale(scale);
                $this.hexmap.transform(m);
                $this.hexmap.selectAll('polygon').attr({'strokeWidth':$this.strokeWidth/scale});
        };
        
        
        
        __construct();
    }
    $(document).ready(function(){
        
        
        var battleMap= new BattleMap('#map');
        var miniMap= new MiniMap('#minimap','#miniMapContainer',battleMap);
        battleMap.viewMode('large');
        //console.log(battleMap.getHexMap().getBBox());
        
         
    
        });
    });
})(jQuery)