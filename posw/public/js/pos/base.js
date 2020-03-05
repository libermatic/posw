export default function base(Pos) {
  if (Pos.extensions && Pos.extensions.includes('base')) {
    return Pos;
  }

  class PosWithBase extends Pos {}
  const extensions = PosWithBase.extensions || [];
  PosWithBase.extensions = [...extensions, 'base'];
  return PosWithBase;
}
