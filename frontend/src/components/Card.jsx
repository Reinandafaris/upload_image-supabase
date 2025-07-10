function Card({ imageUrl }) {
  return (
    <div className="card">
      <img src={imageUrl} alt="Uploaded content" loading="lazy" />
    </div>
  );
}

export default Card;
