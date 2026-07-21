-- Keep products.rating and products.reviews_count in sync with approved reviews.
-- Without this, the rating shown in ProductCard/ProductPage would silently drift
-- from the actual reviews data once admins start approving/rejecting reviews.

CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);

  UPDATE products
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE product_id = target_product_id AND is_approved = true
    ), 0),
    reviews_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = target_product_id AND is_approved = true
    )
  WHERE id = target_product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();
