import React from 'react';
import parse from 'html-react-parser';
export default function Prize(props) {
    const prizeImage = { backgroundImage: 'url(' + props.image + ')' };
    const topStripe = { borderTopColor: props.color };
    return (
        <div className="cell small-11 medium-8 large-5 xlarge-4">
            <div className="rewards-prize--item" style={topStripe}>
                <div className="team-card--image" style={prizeImage}>
                    <img src={props.photo} alt={props.name} />
                </div>
                <h3 className="rewards-prize--title">{props.header}</h3>
                <h4 className="rewards-prize--subtitle">{props.subtitle}</h4>
                <div className="rewards-prize--info i1">
                    <ul>
                        <li>{props.altEmea === '' ? props.description : props.description+'*'}</li>
                    </ul>
                </div>
                <div className="price">{"€"+props.price}</div>
                    <a className="button margin-top-15 btn-blue" onClick={() => props.showForm(props.claimLink)} target="_blank">Claim Prize</a>
                    <div className="footnote">{props.altEmea === '' ? '' : '*Alternative for EMEA: '+props.altEmea}</div>
                
            </div>
        </div>
    )
}
