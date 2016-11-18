/*
    Computes the size of the Visualization CardText component according to the gridItem
    Arguments:
    * gridItem: the gridItem
    Returns:
        An object with computed { width, height } for passing to visualizations as props.
*/
export const resizeVisualization = (gridItem) => {
    if (!gridItem || gridItem.childNodes.length === 0 || gridItem.childNodes[0].childNodes.length === 0)
        return {
            width: 0,
            height: 0
        };

    const card = gridItem.childNodes[0];
    const innerCard = card.childNodes[0].childNodes;
    const width = card.clientWidth;
    let height = card.clientHeight;

    // Handle the case that the title bar is present.
    if (innerCard.length > 1) {
        
        for (var i = 0; i < innerCard.length - 1; i++)
            height -= innerCard[i].clientHeight;
    }

    return {
        width: width,
        height: height
    };
}
