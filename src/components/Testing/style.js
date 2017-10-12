import { theme } from "../../theme";
const style = {
  overlayContainer: {
    color: "rgb(136, 136, 136)",
    backgroundColor: "rgb(255, 255, 255)",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    borderRadius: "2px",
    zIndex: "1",
    marginTop: "20px",
    padding:"14px"
  },

  dataSetTab : {
    textAlign: "center",
    border:"1px solid rgba(117, 110, 110, 0.15)",
    backgroundColor:'rgba(156, 159, 160, 0.48)',
    color:'rgba(0, 0, 0, 0.59)',
    padding: '15px',
    fontWeight: 'bold'
  },

  header : {
    textAlign: "center",
    paddingBottom: "40px"
  },

  dataSetDescriptionSpan : {
    color:'rgba(6, 6, 6, 0.54)',
    flex: "none"
  },

  dataSetDescription : {
    marginBottom: '20px',
    marginTop: '10px'
  },

  isfailedBtn : {
    textAlign : 'center',
    marginTop : '25px',
    flex: 'none'
  },

  isfailedLbl : {
    marginRight : '5px'
  },

  chartsContainer : {
    border:'1px solid rgba(121, 112, 112, 0.23)',
    borderRadius:'5px',
    padding:'15px'
  },

  image : {
    width:'50%',
    cursor:'pointer'
  },

  dashboardTab: {
	   display: "flex-12"
  },

  error: {
    color: "#ad3e3e",
    paddingTop: "10px",
    fontWeight: "bold",
    fontSize: "12px"
  },

  success: {
    color: "#54944a",
    paddingTop: "10px",
    fontWeight: "bold",
    fontSize: "12px"
  },

  actionBtn : {
    marginRight : '5px'
  },
  reportDiv : {
    marginBottom : '10px'
  },
  reportBtn : {
    marginRight : '5px'
  },
  reloadBtn : {
    padding : '5px 10px 5px 10px'
  },
  overlayContainerLoader: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "inline-block",
    textAlign: "center",
  },
  overlayText: {
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
    width: "100%",
    fontSize: "1.2em",
    fontWeight: 300,
    color: theme.palette.blackColor,
  },
  fullWidth: {
    width: "100%",
  }
}

export default style;
