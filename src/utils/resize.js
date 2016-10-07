/*
    Update the Visualization CardText component according to the gridItem
    Arguments:
    * gridItem: the gridItem
    Returns:
        Nothing, simply update the height of the CardText component if needed
*/
export const resizeVisualization = (gridItem) => {
    if (!gridItem)
        return;

    let card          = gridItem.childNodes[0],
        innerCard     = card.childNodes[0].childNodes,
        height        = card.clientHeight - 8, // Always add a padding in Card according to Material-UI.
        cardText;

    if (innerCard.length > 1) {
        cardText = innerCard[1];
        height -= innerCard[0].clientHeight;

    } else {
        cardText = innerCard[0];
    }

    if (cardText.clientHeight === height)
        return;

    cardText.style.height = height + "px";
    // cardText.style.backgroundColor = "#ccc";
}
