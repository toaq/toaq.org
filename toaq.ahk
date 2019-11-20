MsgBox % A_IsUnicode ? "Unicode" : "ANSI"

:?*C:i0::
PutUni("ı")
Return

:?*C:a-::
PutUni("ā")
Return
:?*C:a/::
PutUni("á")
Return
:?*C:aV::
PutUni("ǎ")
Return
:?*C:a?::
PutUni("ả")
Return
:?*C:a^::
PutUni("â")
Return
:?*C:a`\::
PutUni("à")
Return
:?*C:a`~::
PutUni("ã")
Return

:?*C:a1::
PutUni("ā")
Return
:?*C:a2::
PutUni("á")
Return
:?*C:a3::
PutUni("ǎ")
Return
:?*C:a4::
PutUni("ả")
Return
:?*C:a5::
PutUni("â")
Return
:?*C:a6::
PutUni("à")
Return
:?*C:a7::
PutUni("ã")
Return


:?*C:e-::
PutUni("ē")
Return
:?*C:e/::
PutUni("é")
Return
:?*C:eV::
PutUni("ě")
Return
:?*C:e?::
PutUni("ẻ")
Return
:?*C:e^::
PutUni("ê")
Return
:?*C:e`\::
PutUni("è")
Return
:?*C:e`~::
PutUni("ẽ")
Return

:?*C:e1::
PutUni("ē")
Return
:?*C:e2::
PutUni("é")
Return
:?*C:e3::
PutUni("ě")
Return
:?*C:e4::
PutUni("ẻ")
Return
:?*C:e5::
PutUni("ê")
Return
:?*C:e6::
PutUni("è")
Return
:?*C:e7::
PutUni("ẽ")
Return


:?*C:i-::
PutUni("ī")
Return
:?*C:i/::
PutUni("í")
Return
:?*C:iV::
PutUni("ǐ")
Return
:?*C:i?::
PutUni("ỉ")
Return
:?*C:i5::
PutUni("î")
Return
:?*C:i`\::
PutUni("ì")
Return
:?*C:i`~::
PutUni("ĩ")
Return

:?*C:i1::
PutUni("ī")
Return
:?*C:i2::
PutUni("í")
Return
:?*C:i3::
PutUni("ǐ")
Return
:?*C:i4::
PutUni("ỉ")
Return
:?*C:i5::
PutUni("î")
Return
:?*C:i6::
PutUni("ì")
Return
:?*C:i7::
PutUni("ĩ")
Return


:?*C:o-::
PutUni("ō")
Return
:?*C:o/::
PutUni("ó")
Return
:?*C:oV::
PutUni("ǒ")
Return
:?*C:o?::
PutUni("ỏ")
Return
:?*C:o5::
PutUni("ô")
Return
:?*C:o`\::
PutUni("ò")
Return
:?*C:o`~::
PutUni("õ")
Return

:?*C:o1::
PutUni("ō")
Return
:?*C:o2::
PutUni("ó")
Return
:?*C:o3::
PutUni("ǒ")
Return
:?*C:o4::
PutUni("ỏ")
Return
:?*C:o5::
PutUni("ô")
Return
:?*C:o6::
PutUni("ò")
Return
:?*C:o7::
PutUni("õ")
Return


:?*C:u-::
PutUni("ū")
Return
:?*C:u/::
PutUni("ú")
Return
:?*C:uV::
PutUni("ǔ")
Return
:?*C:u?::
PutUni("ủ")
Return
:?*C:u5::
PutUni("û")
Return
:?*C:u`\::
PutUni("ù")
Return
:?*C:u`~::
PutUni("ũ")
Return

:?*C:u1::
PutUni("ū")
Return
:?*C:u2::
PutUni("ú")
Return
:?*C:u3::
PutUni("ǔ")
Return
:?*C:u4::
PutUni("ủ")
Return
:?*C:u5::
PutUni("û")
Return
:?*C:u6::
PutUni("ù")
Return
:?*C:u7::
PutUni("ũ")
Return


PutUni(DataIn)
{
   SavedClip := ClipBoardAll
   ClipBoard =
   If RegExMatch(DataIn, "^[0-9a-fA-F]+$")
   {
      Loop % StrLen(DataIn) / 2
         UTF8Code .= Chr("0x" . SubStr(DataIn, A_Index * 2 - 1, 2))
   }
   Else
      UTF8Code := DataIn
   Transform, ClipBoard, Unicode, %UTF8Code%
   Send ^v
   Sleep 100 ;Generous, less wait or none will often work.
   ClipBoard := SavedClip
   return
}