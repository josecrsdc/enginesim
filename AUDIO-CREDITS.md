# EngineSim audio v0.6.0

Replaces the v0.5.0 recording loops with event-driven combustion and an exhaust model. Each bank feeds header/collector waveguides and a muffler. Intake is a separate path. RPM and load come from EngineSim’s existing adaptive transmission.

Audio core: YigitSalihEmecen/Engine_Sim (MIT), pinned to c3ff61031050f1fc280a864f4bb445f30aeaa0a3. See THIRD-PARTY-NOTICES.md for attribution and license. The adapter, integrated exhaust transients, final output protection and EngineSim controls are local changes. The worklet pauses computation when muted.

The old Freesound recording bank is no longer fetched or played. Its historical provenance remains in v0.5.0. EV and browser fallback retain the previous classic synthesis.

Validation: source rendered at 44.1 and 48 kHz for all three combustion profiles, sweeping idle to redline; finite samples, non-silent output, bounded source peaks and exact muted silence checked. Integration lifecycle and native graph parameter checks run under a mock audio context. These tests do not establish perceptual realism. No in-car listening validation has been performed.

Restore from GitHub only: restore the chosen tag/commit; no visitor version selector.
