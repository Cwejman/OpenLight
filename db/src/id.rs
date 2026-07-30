/// ULID-shaped ids: sortable, globally unique.
pub(crate) fn new_id() -> String {
    ulid::Ulid::new().to_string().to_lowercase()
}
