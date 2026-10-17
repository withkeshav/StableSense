/**
 * "Study this asset" band bridging the asset page and the Learn module.
 */
export default function AssetLearnBand({ meta, goLearn }) {
  return (
    <section class="asset-learn glass">
      <div>
        <p class="panel-kicker">STUDY THIS ASSET</p>
        <h2>{meta.learnQuestion}</h2>
        <p>A short StableSense lesson tied to this asset&apos;s design.</p>
      </div>
      <button type="button" class="primary-btn" onClick={goLearn}>Read the explainer</button>
    </section>
  );
}
