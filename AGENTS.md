<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the illustrative bid demo in the existing client-side store; it is not a live document-analysis service.
- Mount action notifications once in the root layout so all demo controls share a single notification host.
- The dedicated workspace and landing preview reuse the same project review controls and client store so edits stay consistent across both experiences.
