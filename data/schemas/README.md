# Annotation schemas

Version: 0.1.0-candidate | Owner: AI/Engineering Lead | Status: candidate implementation for Product review
ACTUAL TEST: NOT YET TESTED.

[Annotation JSON Schema](annotation-0.1.0-candidate.schema.json) defines case, eight-field annotation/draft, ten-case bundle, review/timing/history and transfer structures using Draft 2020-12. It is not product-locked. Use [semantic validation](../../annotation/src/validation.mjs) as well as shape validation; it enforces relationships not expressible by basic field types.

[Tool guide](../../annotation/README.md) explains timing units, null semantics, limits, imports and evidence boundaries. Version mismatch is rejected; no silent migration or ACTUAL TEST promotion. No completed real-test evidence is supplied.
